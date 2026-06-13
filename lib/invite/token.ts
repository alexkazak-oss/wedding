import { createHash, randomBytes } from 'node:crypto'

export const INVITE_TOKEN_BYTES = 16

export function generateInviteToken(): string {
	return randomBytes(INVITE_TOKEN_BYTES).toString('hex')
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex')
}

export function generateSessionToken(): string {
	return randomBytes(24).toString('hex')
}

export function hashSession(token: string): string {
	return createHash('sha256').update(token).digest('hex')
}

const RU_DIACRITICS = /[̀-ͯ]/g

export function normalizeName(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.normalize('NFKD')
		.replace(RU_DIACRITICS, '')
		.replace(/ё/g, 'е')
		.replace(/\s+/g, ' ')
}

export function namesMatch(a: { first: string; last?: string | null }, b: { first: string; last?: string | null }) {
	const sameFirst = normalizeName(a.first) === normalizeName(b.first)
	if (!sameFirst) return false
	if (!a.last || !b.last) return true
	return normalizeName(a.last) === normalizeName(b.last)
}
