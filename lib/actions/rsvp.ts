'use server'

import {createClient} from '@/lib/supabase/server'
import {z} from 'zod'

const rsvpSchema = z.object({
	guestId: z.string().uuid(),
	status: z.enum(['accepted', 'declined']),
	guestCount: z.number().int().min(0).max(10),
	comment: z.string().max(500).optional(),
})

export async function submitRsvp(formData: {
	guestId: string
	status: 'accepted' | 'declined'
	guestCount: number
	comment?: string
}) {
	const parsed = rsvpSchema.safeParse(formData)
	if (!parsed.success) {
		return {error: 'Invalid form data'}
	}

	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()
	if (!user) {
		return {error: 'Not authenticated'}
	}

	// Verify this guest belongs to this user
	const {data: guest} = await supabase
		.from('guests')
		.select('id, user_id')
		.eq('id', parsed.data.guestId)
		.single()

	if (!guest || guest.user_id !== user.id) {
		return {error: 'Unauthorized'}
	}

	const {error} = await supabase
		.from('guests')
		.update({
			rsvp_status: parsed.data.status,
			guest_count:
				parsed.data.status === 'accepted' ? parsed.data.guestCount : 0,
			comment: parsed.data.comment ?? null,
		})
		.eq('id', parsed.data.guestId)

	if (error) {
		return {error: error.message}
	}

	return {success: true}
}
