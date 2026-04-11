'use server'

import {createClient} from '@/lib/supabase/server'

export async function getContentBlocks(eventId: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('content_blocks')
		.select('*')
		.eq('event_id', eventId)
		.order('sort_order', {ascending: true})

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}

export async function updateContentBlock(
	blockId: string,
	updates: {
		content_ru?: Record<string, unknown>
		content_it?: Record<string, unknown>
	},
) {
	const supabase = await createClient()

	const {error} = await supabase
		.from('content_blocks')
		.update({...updates, updated_at: new Date().toISOString()})
		.eq('id', blockId)

	if (error) return {error: error.message}
	return {success: true}
}

export async function getTimelineItems(eventId: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('timeline_items')
		.select('*')
		.eq('event_id', eventId)
		.order('sort_order', {ascending: true})

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}

export async function updateTimelineItem(
	itemId: string,
	updates: Partial<{
		time: string
		title_ru: string
		title_it: string
		description_ru: string
		description_it: string
		icon: string
		sort_order: number
	}>,
) {
	const supabase = await createClient()

	const {error} = await supabase
		.from('timeline_items')
		.update(updates)
		.eq('id', itemId)

	if (error) return {error: error.message}
	return {success: true}
}

export async function getMenuItems(eventId: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('menu_items')
		.select('*')
		.eq('event_id', eventId)
		.order('sort_order', {ascending: true})

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}

export async function getEvent(slug: string) {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('events')
		.select('*')
		.eq('slug', slug)
		.single()

	if (error) return {error: error.message, data: null}
	return {data, error: null}
}
