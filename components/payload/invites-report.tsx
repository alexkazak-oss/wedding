import config from '@payload-config'
import { getPayload } from 'payload'

// Запись приглашения в объёме, нужном для отчёта (без тяжёлых колонок).
interface ReportInvite {
	guests?: Array<{ firstName?: string | null }> | null
	firstName?: string | null
	partnerFirstName?: string | null
	maxGuests?: number | null
	attending?: 'yes' | 'maybe' | 'no' | null
}

// Сколько людей в приглашении (считаем «по людям»).
function peopleOf(inv: ReportInvite): number {
	const guests = Array.isArray(inv.guests) ? inv.guests.filter((g) => g?.firstName) : []
	if (guests.length > 0) return guests.length
	// Запасной путь для старых записей, ещё не перенесённых в список guests.
	if (inv.firstName) return 1 + (inv.partnerFirstName ? 1 : 0)
	return inv.maxGuests && inv.maxGuests > 0 ? inv.maxGuests : 1
}

interface Stat {
	key: string
	label: string
	people: number
	invites: number
	color: string
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
	return (
		<div
			style={{
				background: 'var(--theme-elevation-0, #1b1b1b)',
				border: '1px solid var(--theme-elevation-100, #2e2e2e)',
				borderRadius: 8,
				padding: '14px 16px',
				minWidth: 0,
			}}
		>
			<div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: 'var(--theme-text, #fff)' }}>
				{value}
			</div>
			<div style={{ marginTop: 4, fontSize: 12, color: 'var(--theme-elevation-650, #9a9a9a)' }}>
				{label}
			</div>
			{sub ? (
				<div style={{ marginTop: 2, fontSize: 11, color: 'var(--theme-elevation-500, #777)' }}>{sub}</div>
			) : null}
		</div>
	)
}

function Bar({ stat, total }: { stat: Stat; total: number }) {
	const pct = total > 0 ? Math.round((stat.people / total) * 100) : 0
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			<div style={{ width: 110, flexShrink: 0, fontSize: 13, color: 'var(--theme-text, #fff)' }}>
				{stat.label}
			</div>
			<div
				style={{
					flex: 1,
					height: 10,
					borderRadius: 6,
					background: 'var(--theme-elevation-100, #2e2e2e)',
					overflow: 'hidden',
				}}
			>
				<div style={{ width: `${pct}%`, height: '100%', background: stat.color, borderRadius: 6 }} />
			</div>
			<div
				style={{
					width: 96,
					flexShrink: 0,
					textAlign: 'right',
					fontSize: 13,
					color: 'var(--theme-elevation-650, #9a9a9a)',
				}}
			>
				<strong style={{ color: 'var(--theme-text, #fff)' }}>{stat.people}</strong> чел · {pct}%
			</div>
		</div>
	)
}

export async function InvitesReport() {
	const payload = await getPayload({ config })

	const { docs } = await payload.find({
		collection: 'invites',
		depth: 0,
		limit: 0, // все записи
		pagination: false,
		overrideAccess: true,
		select: {
			guests: true,
			firstName: true,
			partnerFirstName: true,
			maxGuests: true,
			attending: true,
		},
	})

	const invites = docs as unknown as ReportInvite[]

	let totalPeople = 0
	const tally = {
		yes: { people: 0, invites: 0 },
		maybe: { people: 0, invites: 0 },
		no: { people: 0, invites: 0 },
		none: { people: 0, invites: 0 },
	}

	for (const inv of invites) {
		const people = peopleOf(inv)
		totalPeople += people
		const bucket = inv.attending === 'yes' || inv.attending === 'maybe' || inv.attending === 'no' ? inv.attending : 'none'
		tally[bucket].people += people
		tally[bucket].invites += 1
	}

	const respondedPeople = tally.yes.people + tally.maybe.people + tally.no.people
	const respondedInvites = tally.yes.invites + tally.maybe.invites + tally.no.invites
	const totalInvites = invites.length

	const bars: Stat[] = [
		{ key: 'yes', label: 'Придут', people: tally.yes.people, invites: tally.yes.invites, color: 'var(--theme-success-500, #3aa657)' },
		{ key: 'maybe', label: 'Подумают', people: tally.maybe.people, invites: tally.maybe.invites, color: 'var(--theme-warning-500, #d9a534)' },
		{ key: 'no', label: 'Не придут', people: tally.no.people, invites: tally.no.invites, color: 'var(--theme-error-500, #c0413b)' },
		{ key: 'none', label: 'Не ответили', people: tally.none.people, invites: tally.none.invites, color: 'var(--theme-elevation-400, #6a6a6a)' },
	]

	return (
		<div
			style={{
				margin: '0 0 28px',
				padding: 20,
				borderRadius: 10,
				background: 'var(--theme-elevation-50, #161616)',
				border: '1px solid var(--theme-elevation-100, #2e2e2e)',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
				
				
			</div>

			<div
				style={{
					marginTop: 16,
					display: 'grid',
					gap: 12,
					gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
				}}
			>
				<StatCard label="Всего приглашено" value={totalPeople} sub={`${totalInvites} приглашений`} />
				<StatCard
					label="Ответили"
					value={respondedPeople}
					sub={`${respondedInvites} из ${totalInvites} приглашений`}
				/>
				<StatCard label="Не ответили" value={tally.none.people} sub={`${tally.none.invites} приглашений`} />
				<StatCard label="Придут" value={tally.yes.people} sub={`${tally.yes.invites} приглашений`} />
			</div>

			<div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
				{bars.map((stat) => (
					<Bar key={stat.key} stat={stat} total={totalPeople} />
				))}
			</div>
		</div>
	)
}
