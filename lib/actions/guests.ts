'use server'

import {createClient} from '@/lib/supabase/server'

export async function getGuests(eventId: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('guests')
		.select('*')
		.eq('event_id', eventId)
		.order('created_at', {ascending: true})

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}

export async function updateGuestStatus(
	guestId: string,
	status: 'pending' | 'accepted' | 'declined',
) {
	const supabase = await createClient()

	const {error} = await supabase
		.from('guests')
		.update({rsvp_status: status})
		.eq('id', guestId)

	if (error) return {error: error.message}
	return {success: true}
}

export async function addGuest(formData: {
	eventId: string
	name: string
	email: string
	role?: 'guest' | 'admin'
}) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('guests')
		.insert({
			event_id: formData.eventId,
			name: formData.name,
			email: formData.email,
			role: formData.role ?? 'guest',
		})
		.select()
		.single()

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}

export async function deleteGuest(guestId: string) {
	const supabase = await createClient()

	const {error} = await supabase.from('guests').delete().eq('id', guestId)

	if (error) return {error: error.message}
	return {success: true}
}
