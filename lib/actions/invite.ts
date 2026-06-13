'use server'

import {
	clearInviteSessionCookie,
	getInviteSessionCookie,
	setInviteSessionCookie,
} from '@/lib/invite/cookies'
import {
	generateSessionToken,
	hashSession,
	hashToken,
	namesMatch,
} from '@/lib/invite/token'
import type { InviteSnapshot, Locale } from '@/types'
import { headers } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

// ─── Shape of a Payload invite doc ───────────────────

export interface PayloadInvite {
	id: number | string
	greeting: string
	displayNames: string
	firstName: string
	lastName?: string | null
	partnerFirstName?: string | null
	partnerLastName?: string | null
	locale: Locale
	maxGuests: number
	rsvpStatus: 'pending' | 'accepted' | 'declined'
	guestCount: number
	comment?: string | null
	tokenRaw?: string | null
	tokenHash: string
	frozenSnapshot?: InviteSnapshot | null
	openedAt?: string | null
	lastSeenAt?: string | null
	createdAt: string
	updatedAt: string
}

async function payload() {
	return getPayload({ config })
}

async function readUserAgent() {
	const h = await headers()
	return h.get('user-agent') ?? null
}

// ─── Public: open invitation by token ────────────────

export type OpenInviteResult =
	| { state: 'ok'; invite: PayloadInvite }
	| { state: 'verify'; inviteId: string | number; needsLastName: boolean }
	| { state: 'not_found' }

export async function openInviteByToken(rawToken: string): Promise<OpenInviteResult> {
	const tokenHash = hashToken(rawToken)
	const p = await payload()

	const found = await p.find({
		collection: 'invites',
		where: { tokenHash: { equals: tokenHash } },
		limit: 1,
		overrideAccess: true,
	})

	const invite = found.docs[0] as PayloadInvite | undefined
	if (!invite) return { state: 'not_found' }

	const sessionRaw = await getInviteSessionCookie()
	if (sessionRaw) {
		const sessionLookup = await p.find({
			collection: 'invite-sessions',
			where: { sessionHash: { equals: hashSession(sessionRaw) } },
			limit: 1,
			overrideAccess: true,
		})
		const session = sessionLookup.docs[0] as unknown as
			| { id: string | number; invite: string | number | { id: string | number } }
			| undefined

		if (session) {
			const sessionInviteId =
				typeof session.invite === 'object' && session.invite !== null
					? session.invite.id
					: session.invite

			if (String(sessionInviteId) === String(invite.id)) {
				const now = new Date().toISOString()
				await p.update({
					collection: 'invite-sessions',
					id: session.id,
					data: { lastSeenAt: now },
					overrideAccess: true,
				})
				await p.update({
					collection: 'invites',
					id: invite.id,
					data: { lastSeenAt: now },
					overrideAccess: true,
				})
				return { state: 'ok', invite }
			}
		}
	}

	if (!invite.openedAt) {
		const updated = await freezeAndStartSession(invite)
		return { state: 'ok', invite: updated }
	}

	return {
		state: 'verify',
		inviteId: invite.id,
		needsLastName: Boolean(invite.lastName),
	}
}

async function freezeAndStartSession(invite: PayloadInvite): Promise<PayloadInvite> {
	const p = await payload()
	const now = new Date().toISOString()

	const snapshot: InviteSnapshot = {
		greeting: invite.greeting,
		displayNames: invite.displayNames,
		maxGuests: invite.maxGuests,
		locale: invite.locale,
		openedAt: now,
	}

	const updated = await p.update({
		collection: 'invites',
		id: invite.id,
		data: {
			openedAt: now,
			lastSeenAt: now,
			frozenSnapshot: snapshot,
		},
		overrideAccess: true,
	})

	await p.create({
		collection: 'invite-access-logs',
		data: {
			invite: invite.id,
			event: 'opened',
			userAgent: await readUserAgent(),
		},
		overrideAccess: true,
	})

	await issueSessionCookie(invite.id)
	return updated as unknown as PayloadInvite
}

async function issueSessionCookie(inviteId: string | number) {
	const p = await payload()
	const raw = generateSessionToken()
	const hash = hashSession(raw)

	await p.create({
		collection: 'invite-sessions',
		data: {
			invite: inviteId,
			sessionHash: hash,
			userAgent: await readUserAgent(),
			lastSeenAt: new Date().toISOString(),
		},
		overrideAccess: true,
	})

	await setInviteSessionCookie(raw)
}

// ─── Public: verify by first/last name ───────────────

const verifySchema = z.object({
	inviteId: z.union([z.string(), z.number()]),
	firstName: z.string().min(1).max(80),
	lastName: z.string().max(80).optional(),
})

export async function verifyGuestByName(input: {
	inviteId: string | number
	firstName: string
	lastName?: string
}) {
	const parsed = verifySchema.safeParse(input)
	if (!parsed.success) return { ok: false as const, error: 'Invalid input' }

	const p = await payload()
	const found = (await p.findByID({
		collection: 'invites',
		id: parsed.data.inviteId,
		overrideAccess: true,
	})) as unknown as PayloadInvite | null

	if (!found) return { ok: false as const, error: 'Not found' }

	const candidates: Array<{ first: string; last: string | null }> = [
		{ first: found.firstName, last: found.lastName ?? null },
	]
	if (found.partnerFirstName) {
		candidates.push({ first: found.partnerFirstName, last: found.partnerLastName ?? null })
	}

	const inputName = { first: parsed.data.firstName, last: parsed.data.lastName ?? null }
	const matched = candidates.some((c) => namesMatch(c, inputName))

	if (!matched) {
		await p.create({
			collection: 'invite-access-logs',
			data: { invite: found.id, event: 'verify_failed', userAgent: await readUserAgent() },
			overrideAccess: true,
		})
		return { ok: false as const, error: 'Имя не совпало с приглашением' }
	}

	await p.create({
		collection: 'invite-access-logs',
		data: { invite: found.id, event: 'verify_ok', userAgent: await readUserAgent() },
		overrideAccess: true,
	})

	await issueSessionCookie(found.id)
	return { ok: true as const }
}

// ─── Public: read current invite via cookie ──────────

export async function getCurrentInvite(): Promise<PayloadInvite | null> {
	const sessionRaw = await getInviteSessionCookie()
	if (!sessionRaw) return null

	const p = await payload()
	const sessionLookup = await p.find({
		collection: 'invite-sessions',
		where: { sessionHash: { equals: hashSession(sessionRaw) } },
		limit: 1,
		overrideAccess: true,
	})
	const session = sessionLookup.docs[0] as unknown as
		| { invite: string | number | { id: string | number } }
		| undefined
	if (!session) return null

	const inviteId =
		typeof session.invite === 'object' && session.invite !== null
			? session.invite.id
			: session.invite

	const invite = (await p.findByID({
		collection: 'invites',
		id: inviteId,
		overrideAccess: true,
	})) as unknown as PayloadInvite | null

	return invite ?? null
}

export async function signOutInvite() {
	await clearInviteSessionCookie()
}
