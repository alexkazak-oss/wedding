// ─── Enums ───────────────────────────────────────────

export type RsvpStatus = 'pending' | 'accepted' | 'declined'
export type UserRole = 'guest' | 'admin'
export type SenderRole = 'guest' | 'admin'
export type Locale = 'ru' | 'it'

export type ContentSection =
	| 'cover'
	| 'story'
	| 'timeline'
	| 'venue'
	| 'dresscode'
	| 'menu'
	| 'info'

// ─── Database Entities ──────────────────────────────

export interface Event {
	id: string
	slug: string
	title_ru: string
	title_it: string
	date: string
	couple_name_1: string
	couple_name_2: string
	venue_name_ru: string
	venue_name_it: string
	venue_address: string
	venue_lat: number | null
	venue_lng: number | null
	created_at: string
}

export interface Guest {
	id: string
	event_id: string
	user_id: string | null
	name: string
	email: string
	invite_token: string
	rsvp_status: RsvpStatus
	guest_count: number
	comment: string | null
	role: UserRole
	created_at: string
}

// Personal invitations now live in Payload; shapes are in lib/actions/invite.ts.
export interface InviteSnapshot {
	greeting: string
	displayNames: string
	maxGuests: number
	locale: Locale
	openedAt: string
}

export interface ContentBlock {
	id: string
	event_id: string
	section: ContentSection
	content_ru: Record<string, unknown>
	content_it: Record<string, unknown>
	sort_order: number
	updated_at: string
}

export interface TimelineItem {
	id: string
	event_id: string
	time: string
	title_ru: string
	title_it: string
	description_ru: string
	description_it: string
	icon: string | null
	sort_order: number
}

export interface MenuItem {
	id: string
	event_id: string
	category_ru: string
	category_it: string
	name_ru: string
	name_it: string
	description_ru: string | null
	description_it: string | null
	sort_order: number
}

export interface Message {
	id: string
	event_id: string
	guest_id: string
	sender_role: SenderRole
	content: string
	created_at: string
}

// ─── Localized helpers ──────────────────────────────

export interface LocalizedText {
	ru: string
	it: string
}

// ─── RSVP Form ──────────────────────────────────────

export interface RsvpFormData {
	status: 'accepted' | 'declined'
	guestCount: number
	comment: string
}

// ─── Auth ───────────────────────────────────────────

export interface SessionUser {
	id: string
	email: string
	role: UserRole
	guestId: string
	eventId: string
}
