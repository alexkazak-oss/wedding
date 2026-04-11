'use server'

import {createClient} from '@/lib/supabase/server'
import {redirect} from 'next/navigation'

export async function signInWithMagicLink(formData: FormData) {
	const email = formData.get('email') as string
	const locale = (formData.get('locale') as string) || 'ru'

	if (!email) {
		return {error: 'Email is required'}
	}

	const supabase = await createClient()

	const {error} = await supabase.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback`,
		},
	})

	if (error) {
		return {error: error.message}
	}

	return {success: true}
}

export async function signInWithInviteToken(token: string, locale: string) {
	const supabase = await createClient()

	// Find guest by invite token
	const {data: guest, error: guestError} = await supabase
		.from('guests')
		.select('*')
		.eq('invite_token', token)
		.single()

	if (guestError || !guest) {
		return {error: 'Invalid invitation'}
	}

	// If user is already linked, just sign them in
	if (guest.user_id) {
		return {error: 'Please use your email to sign in'}
	}

	// Sign in with OTP using guest email
	const {error} = await supabase.auth.signInWithOtp({
		email: guest.email,
		options: {
			emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback?token=${token}`,
		},
	})

	if (error) {
		return {error: error.message}
	}

	return {success: true, email: guest.email}
}

export async function signOut() {
	const supabase = await createClient()
	await supabase.auth.signOut()
	redirect('/')
}

export async function getCurrentGuest() {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()
	if (!user) return null

	const {data: guest} = await supabase
		.from('guests')
		.select('*')
		.eq('user_id', user.id)
		.single()

	return guest
}

export async function linkGuestToUser(token: string) {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()
	if (!user) return {error: 'Not authenticated'}

	// Update guest record to link with this user
	const {error} = await supabase
		.from('guests')
		.update({user_id: user.id})
		.eq('invite_token', token)
		.is('user_id', null)

	if (error) {
		return {error: error.message}
	}

	return {success: true}
}
