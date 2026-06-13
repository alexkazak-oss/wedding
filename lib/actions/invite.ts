'use server'

import {
	clearInviteSessionCookie,
	getInviteSessionCookie,
	setInviteSessionCookie,
} from '@/lib/invite/cookies'
import {
	generateInviteToken,
	generateSessionToken,
	hashSession,
	hashToken,
	namesMatch,
} from '@/lib/invite/token'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Guest, InviteSnapshot, Locale } from '@/types'
import { headers } from 'next/headers'
import { z } from 'zod'

// ─── Helpers ─────────────────────────────────────────

type AdminGate = { ok: true } | { ok: false; error: string }

async function requireAdmin(): Promise<AdminGate> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { ok: false, error: 'Not authenticated' }

	const { data: me } = await supabase
		.from('guests')
		.select('role')
		.eq('user_id', user.id)
		.single()

	if (me?.role !== 'admin') return { ok: false, error: 'Forbidden' }
	return { ok: true }
}

async function readUserAgent() {
	const h = await headers()
	return h.get('user-agent') ?? null
}

// ─── Admin: create invitation ────────────────────────

const createInviteSchema = z.object({
	eventId: z.string().uuid(),
	greeting: z.string().min(1).max(200),
	displayNames: z.string().min(1).max(200),
	firstName: z.string().min(1).max(80),
	lastName: z.string().max(80).optional().nullable(),
	partnerFirstName: z.string().max(80).optional().nullable(),
	partnerLastName: z.string().max(80).optional().nullable(),
	locale: z.enum(['ru', 'it']),
	maxGuests: z.number().int().min(1).max(20),
	email: z.string().email().optional().nullable(),
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>

export type CreateInviteResult =
	| { ok: true; guestId: string; token: string }
	| { ok: false; error: string }

export async function createInvite(input: CreateInviteInput): Promise<CreateInviteResult> {
	const gate = await requireAdmin()
	if (!gate.ok) return { ok: false, error: gate.error }

	const parsed = createInviteSchema.safeParse(input)
	if (!parsed.success) return { ok: false, error: 'Invalid input' }

	const token = generateInviteToken()
	const tokenHash = hashToken(token)

	const admin = createAdminClient()
	const { data, error } = await admin
		.from('guests')
		.insert({
			event_id: parsed.data.eventId,
			name: parsed.data.displayNames,
			email: parsed.data.email ?? `${token}@invite.local`,
			invite_token: token,
			token_hash: tokenHash,
			greeting: parsed.data.greeting,
			display_names: parsed.data.displayNames,
			first_name: parsed.data.firstName,
			last_name: parsed.data.lastName ?? null,
			partner_first_name: parsed.data.partnerFirstName ?? null,
			partner_last_name: parsed.data.partnerLastName ?? null,
			locale: parsed.data.locale,
			max_guests: parsed.data.maxGuests,
			rsvp_status: 'pending',
			guest_count: 1,
		})
		.select('id')
		.single()

	if (error) return { ok: false, error: error.message }

	return { ok: true, guestId: data.id, token }
}

// ─── Admin: list invitations ─────────────────────────

export async function listInvites(eventId: string) {
	const gate = await requireAdmin()
	if (!gate.ok) return { error: gate.error, invites: null }

	const admin = createAdminClient()
	const { data, error } = await admin
		.from('guests')
		.select(
			'id, name, display_names, greeting, first_name, last_name, locale, max_guests, invite_token, opened_at, last_seen_at, rsvp_status, guest_count, created_at',
		)
		.eq('event_id', eventId)
		.order('created_at', { ascending: false })

	if (error) return { error: error.message, invites: null }
	return { invites: data, error: null }
}

// ─── Public: open invitation by token ────────────────

export type OpenInviteResult =
	| { state: 'ok'; guest: Guest }
	| { state: 'verify'; guestId: string; needsLastName: boolean }
	| { state: 'not_found' }

export async function openInviteByToken(rawToken: string): Promise<OpenInviteResult> {
	const tokenHash = hashToken(rawToken)
	const admin = createAdminClient()

	const { data: guest } = await admin
		.from('guests')
		.select('*')
		.eq('token_hash', tokenHash)
		.single()

	if (!guest) return { state: 'not_found' }

	// Check existing session cookie
	const sessionRaw = await getInviteSessionCookie()
	if (sessionRaw) {
		const { data: session } = await admin
			.from('invite_sessions')
			.select('id, guest_id')
			.eq('session_hash', hashSession(sessionRaw))
			.single()

		if (session && session.guest_id === guest.id) {
			await admin.from('invite_sessions').update({ last_seen_at: new Date().toISOString() }).eq('id', session.id)
			await admin.from('guests').update({ last_seen_at: new Date().toISOString() }).eq('id', guest.id)
			return { state: 'ok', guest: guest as Guest }
		}
	}

	// No session for this device
	if (!guest.opened_at) {
		// First open ever — freeze + create session
		await freezeAndStartSession(guest as Guest)
		return { state: 'ok', guest: guest as Guest }
	}

	// Already opened on another device — verify identity
	return {
		state: 'verify',
		guestId: guest.id,
		needsLastName: Boolean(guest.last_name),
	}
}

async function freezeAndStartSession(guest: Guest) {
	const admin = createAdminClient()
	const now = new Date().toISOString()

	const snapshot: InviteSnapshot = {
		greeting: guest.greeting ?? '',
		displayNames: guest.display_names ?? guest.name,
		maxGuests: guest.max_guests,
		locale: (guest.locale ?? 'ru') as Locale,
		openedAt: now,
	}

	await admin
		.from('guests')
		.update({
			opened_at: now,
			last_seen_at: now,
			frozen_snapshot: snapshot,
		})
		.eq('id', guest.id)

	await admin.from('invite_access_logs').insert({
		guest_id: guest.id,
		event: 'opened',
		user_agent: await readUserAgent(),
	})

	await issueSessionCookie(guest.id)
}

async function issueSessionCookie(guestId: string) {
	const admin = createAdminClient()
	const raw = generateSessionToken()
	const hash = hashSession(raw)

	await admin.from('invite_sessions').insert({
		guest_id: guestId,
		session_hash: hash,
		user_agent: await readUserAgent(),
	})

	await setInviteSessionCookie(raw)
}

// ─── Public: verify by first/last name ───────────────

const verifySchema = z.object({
	guestId: z.string().uuid(),
	firstName: z.string().min(1).max(80),
	lastName: z.string().max(80).optional(),
})

export async function verifyGuestByName(input: {
	guestId: string
	firstName: string
	lastName?: string
}) {
	const parsed = verifySchema.safeParse(input)
	if (!parsed.success) return { ok: false as const, error: 'Invalid input' }

	const admin = createAdminClient()
	const { data: guest } = await admin
		.from('guests')
		.select('id, first_name, last_name, partner_first_name, partner_last_name')
		.eq('id', parsed.data.guestId)
		.single()

	if (!guest) return { ok: false as const, error: 'Not found' }

	const candidates: Array<{ first: string; last: string | null }> = []
	if (guest.first_name) candidates.push({ first: guest.first_name, last: guest.last_name })
	if (guest.partner_first_name)
		candidates.push({ first: guest.partner_first_name, last: guest.partner_last_name })

	const input_name = { first: parsed.data.firstName, last: parsed.data.lastName ?? null }
	const matched = candidates.some((c) => namesMatch(c, input_name))

	if (!matched) {
		await admin.from('invite_access_logs').insert({
			guest_id: guest.id,
			event: 'verify_failed',
			user_agent: await readUserAgent(),
		})
		return { ok: false as const, error: 'Имя не совпало с приглашением' }
	}

	await admin.from('invite_access_logs').insert({
		guest_id: guest.id,
		event: 'verify_ok',
		user_agent: await readUserAgent(),
	})

	await issueSessionCookie(guest.id)
	return { ok: true as const }
}

// ─── Public: read current session ────────────────────

export async function getCurrentInvite(): Promise<Guest | null> {
	const sessionRaw = await getInviteSessionCookie()
	if (!sessionRaw) return null

	const admin = createAdminClient()
	const { data: session } = await admin
		.from('invite_sessions')
		.select('guest_id')
		.eq('session_hash', hashSession(sessionRaw))
		.single()

	if (!session) return null

	const { data: guest } = await admin
		.from('guests')
		.select('*')
		.eq('id', session.guest_id)
		.single()

	return (guest as Guest | null) ?? null
}

export async function signOutInvite() {
	await clearInviteSessionCookie()
}
