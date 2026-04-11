'use server'

import {createClient} from '@/lib/supabase/server'
import {z} from 'zod'

const messageSchema = z.object({
	guestId: z.string().uuid(),
	eventId: z.string().uuid(),
	content: z.string().min(1).max(2000),
	senderRole: z.enum(['guest', 'admin']),
})

export async function sendMessage(formData: {
	guestId: string
	eventId: string
	content: string
	senderRole: 'guest' | 'admin'
}) {
	const parsed = messageSchema.safeParse(formData)
	if (!parsed.success) {
		return {error: 'Invalid message data'}
	}

	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()
	if (!user) {
		return {error: 'Not authenticated'}
	}

	const {error} = await supabase.from('messages').insert({
		event_id: parsed.data.eventId,
		guest_id: parsed.data.guestId,
		sender_role: parsed.data.senderRole,
		content: parsed.data.content,
	})

	if (error) {
		return {error: error.message}
	}

	return {success: true}
}

export async function getMessages(guestId: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('messages')
		.select('*')
		.eq('guest_id', guestId)
		.order('created_at', {ascending: true})

	if (error) {
		return {error: error.message, data: null}
	}

	return {data, error: null}
}
