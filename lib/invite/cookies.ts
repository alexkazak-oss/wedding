import { cookies } from 'next/headers'

export const INVITE_SESSION_COOKIE = 'invite_session'
const ONE_YEAR_S = 60 * 60 * 24 * 365

export async function setInviteSessionCookie(rawToken: string) {
	const jar = await cookies()
	jar.set(INVITE_SESSION_COOKIE, rawToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: ONE_YEAR_S,
	})
}

export async function getInviteSessionCookie(): Promise<string | null> {
	const jar = await cookies()
	return jar.get(INVITE_SESSION_COOKIE)?.value ?? null
}

export async function clearInviteSessionCookie() {
	const jar = await cookies()
	jar.delete(INVITE_SESSION_COOKIE)
}
