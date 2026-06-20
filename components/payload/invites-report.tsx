import config from '@payload-config'
import { getPayload } from 'payload'
import { InvitesReportClient, type ReportRow } from './invites-report-client'

// Запись приглашения в объёме, нужном для отчёта (без тяжёлых колонок).
interface ReportInvite {
	id: string | number
	displayNames?: string | null
	guests?: Array<{ firstName?: string | null; lastName?: string | null }> | null
	firstName?: string | null
	lastName?: string | null
	partnerFirstName?: string | null
	maxGuests?: number | null
	attending?: 'yes' | 'maybe' | 'no' | null
	transport?: 'borisov' | 'minsk' | 'none' | null
	alcohol?: string[] | null
	allergies?: string | null
}

// Сколько людей в приглашении (считаем «по людям»).
function peopleOf(inv: ReportInvite): number {
	const guests = Array.isArray(inv.guests) ? inv.guests.filter((g) => g?.firstName) : []
	if (guests.length > 0) return guests.length
	// Запасной путь для старых записей, ещё не перенесённых в список guests.
	if (inv.firstName) return 1 + (inv.partnerFirstName ? 1 : 0)
	return inv.maxGuests && inv.maxGuests > 0 ? inv.maxGuests : 1
}

// Имя приглашения для списка: заголовок displayNames, иначе собираем из гостей.
function nameOf(inv: ReportInvite): string {
	if (inv.displayNames && inv.displayNames.trim()) return inv.displayNames.trim()
	const guests = Array.isArray(inv.guests) ? inv.guests.filter((g) => g?.firstName) : []
	if (guests.length > 0) {
		return guests.map((g) => `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim()).filter(Boolean).join(', ')
	}
	const parts = [inv.firstName, inv.partnerFirstName].filter(Boolean)
	return parts.length > 0 ? parts.join(', ') : 'Без имени'
}

const ALCOHOL_VALUES = ['sparkling', 'white', 'red', 'vodka', 'whisky'] as const

export async function InvitesReport() {
	const payload = await getPayload({ config })

	const { docs } = await payload.find({
		collection: 'invites',
		depth: 0,
		limit: 0, // все записи
		pagination: false,
		overrideAccess: true,
		select: {
			displayNames: true,
			guests: true,
			firstName: true,
			lastName: true,
			partnerFirstName: true,
			maxGuests: true,
			attending: true,
			transport: true,
			alcohol: true,
			allergies: true,
		},
	})

	const invites = docs as unknown as ReportInvite[]

	const rows: ReportRow[] = invites.map((inv) => {
		const attending = inv.attending === 'yes' || inv.attending === 'maybe' || inv.attending === 'no' ? inv.attending : 'none'
		const transport =
			inv.transport === 'borisov' || inv.transport === 'minsk' || inv.transport === 'none' ? inv.transport : 'unset'
		const alcohol = (Array.isArray(inv.alcohol) ? inv.alcohol : []).filter((a): a is (typeof ALCOHOL_VALUES)[number] =>
			(ALCOHOL_VALUES as readonly string[]).includes(a),
		)
		return {
			id: String(inv.id),
			name: nameOf(inv),
			people: peopleOf(inv),
			attending,
			transport,
			alcohol,
			allergies: inv.allergies?.trim() || null,
		}
	})

	return <InvitesReportClient rows={rows} />
}
