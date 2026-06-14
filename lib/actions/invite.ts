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

export type AlcoholOption = 'sparkling' | 'white' | 'red' | 'vodka' | 'whisky'

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
	email?: string | null
	phone?: string | null
	rsvpStatus: 'pending' | 'accepted' | 'declined'
	guestCount: number
	comment?: string | null
	// Анкета (RSVP)
	attending?: 'yes' | 'maybe' | 'no' | null
	transport?: 'borisov' | 'minsk' | 'none' | null
	allergies?: string | null
	alcohol?: AlcoholOption[] | null
	rsvpSubmittedAt?: string | null
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
	| { state: 'not_found' }

/**
 * Открытие приглашения по ссылке (токену). Владение ссылкой = доступ,
 * поэтому страница открывается на любом устройстве без проверки личности.
 * Эта функция вызывается при рендере страницы, поэтому НЕ пишет cookie
 * (Next.js это запрещает в Server Component) — сессию ставит claimInviteSession.
 */
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

	const now = new Date().toISOString()

	// Первое открытие — замораживаем snapshot и пишем в лог.
	if (!invite.openedAt) {
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
			data: { openedAt: now, lastSeenAt: now, frozenSnapshot: snapshot },
			overrideAccess: true,
		})
		await p.create({
			collection: 'invite-access-logs',
			data: { invite: invite.id, event: 'opened', userAgent: await readUserAgent() },
			overrideAccess: true,
		})
		return { state: 'ok', invite: updated as unknown as PayloadInvite }
	}

	await p.update({
		collection: 'invites',
		id: invite.id,
		data: { lastSeenAt: now },
		overrideAccess: true,
	})
	return { state: 'ok', invite }
}

/**
 * Ставит cookie-сессию для устройства, открывшего ссылку, чтобы при заходе
 * на главную (/{locale}) гостя сразу редиректило на его приглашение.
 * Вызывается из клиента (Server Action) — запись cookie здесь разрешена.
 */
export async function claimInviteSession(rawToken: string): Promise<void> {
	const tokenHash = hashToken(rawToken)
	const p = await payload()

	const found = await p.find({
		collection: 'invites',
		where: { tokenHash: { equals: tokenHash } },
		limit: 1,
		overrideAccess: true,
	})
	const invite = found.docs[0] as PayloadInvite | undefined
	if (!invite) return

	// Уже есть валидная сессия именно для этого приглашения — ничего не делаем.
	const existing = await getInviteSessionCookie()
	if (existing) {
		const look = await p.find({
			collection: 'invite-sessions',
			where: { sessionHash: { equals: hashSession(existing) } },
			limit: 1,
			overrideAccess: true,
		})
		const s = look.docs[0] as unknown as
			| { invite: string | number | { id: string | number } }
			| undefined
		if (s) {
			const sid = typeof s.invite === 'object' && s.invite !== null ? s.invite.id : s.invite
			if (String(sid) === String(invite.id)) return
		}
	}

	await issueSessionCookie(invite.id)
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

// ─── Public: recover invite by name (home-page gate) ──

const findSchema = z.object({
	firstName: z.string().min(1).max(80),
	lastName: z.string().min(1).max(80),
})

export type FindInviteResult =
	| { ok: true; locale: Locale; token: string }
	| { ok: false; error: string }

/**
 * Поиск приглашения по имени и фамилии среди всех приглашений.
 * Совпадение по любому из гостей группы (основной или партнёр) —
 * достаточно данных одного человека, чтобы открыть общее приглашение.
 */
export async function findInviteByName(input: {
	firstName: string
	lastName: string
}): Promise<FindInviteResult> {
	const parsed = findSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, error: 'Введите имя и фамилию.' }
	}

	const p = await payload()
	const all = await p.find({
		collection: 'invites',
		limit: 1000,
		overrideAccess: true,
	})

	const inputName = { first: parsed.data.firstName, last: parsed.data.lastName }

	const matches = (all.docs as unknown as PayloadInvite[]).filter((invite) => {
		const candidates: Array<{ first: string; last: string | null }> = [
			{ first: invite.firstName, last: invite.lastName ?? null },
		]
		if (invite.partnerFirstName) {
			candidates.push({ first: invite.partnerFirstName, last: invite.partnerLastName ?? null })
		}
		return candidates.some((c) => namesMatch(c, inputName))
	})

	if (matches.length === 0) {
		return {
			ok: false,
			error: 'Мы не нашли вас в списке гостей. Проверьте имя и фамилию.',
		}
	}

	if (matches.length > 1) {
		return {
			ok: false,
			error: 'Найдено несколько совпадений. Откройте приглашение по персональной ссылке.',
		}
	}

	const invite = matches[0]
	if (!invite.tokenRaw) {
		return { ok: false, error: 'Ссылка приглашения недоступна. Свяжитесь с организаторами.' }
	}

	await p.create({
		collection: 'invite-access-logs',
		data: { invite: invite.id, event: 'verify_ok', userAgent: await readUserAgent() },
		overrideAccess: true,
	})

	await issueSessionCookie(invite.id)
	return { ok: true, locale: invite.locale, token: invite.tokenRaw }
}

// ─── Public: save / edit RSVP questionnaire ──────────

const rsvpSchema = z.object({
	token: z.string().min(8),
	attending: z.enum(['yes', 'maybe', 'no']).nullable().optional(),
	transport: z.enum(['borisov', 'minsk', 'none']).nullable().optional(),
	allergies: z.string().max(1000).nullable().optional(),
	alcohol: z
		.array(z.enum(['sparkling', 'white', 'red', 'vodka', 'whisky']))
		.max(3)
		.optional(),
})

export type SaveRsvpInput = {
	token: string
	attending?: 'yes' | 'maybe' | 'no' | null
	transport?: 'borisov' | 'minsk' | 'none' | null
	allergies?: string | null
	alcohol?: AlcoholOption[]
}

export async function saveRsvp(
	input: SaveRsvpInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
	const parsed = rsvpSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, error: 'Проверьте заполнение анкеты.' }
	}

	const p = await payload()
	const found = await p.find({
		collection: 'invites',
		where: { tokenHash: { equals: hashToken(parsed.data.token) } },
		limit: 1,
		overrideAccess: true,
	})
	const invite = found.docs[0] as PayloadInvite | undefined
	if (!invite) return { ok: false, error: 'Приглашение не найдено.' }

	await p.update({
		collection: 'invites',
		id: invite.id,
		data: {
			attending: parsed.data.attending ?? null,
			transport: parsed.data.transport ?? null,
			allergies: parsed.data.allergies ?? null,
			alcohol: parsed.data.alcohol ?? [],
			rsvpSubmittedAt: new Date().toISOString(),
			// Ответ о присутствии отражаем и в общем статусе.
			rsvpStatus:
				parsed.data.attending === 'yes'
					? 'accepted'
					: parsed.data.attending === 'no'
						? 'declined'
						: parsed.data.attending === 'maybe'
							? 'pending'
							: invite.rsvpStatus,
		},
		overrideAccess: true,
	})

	return { ok: true }
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

	// disableErrors: вернуть null, а не бросать, если приглашение удалили в админке.
	const invite = (await p.findByID({
		collection: 'invites',
		id: inviteId,
		overrideAccess: true,
		disableErrors: true,
	})) as unknown as PayloadInvite | null

	return invite ?? null
}

export async function signOutInvite() {
	await clearInviteSessionCookie()
}
