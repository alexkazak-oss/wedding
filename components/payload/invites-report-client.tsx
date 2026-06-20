'use client'

import { useMemo, useState } from 'react'

// Отчёт по гостям с интерактивной фильтрацией. Клик по карточке/полосе/чипу
// включает фильтр, повторный клик — выключает. Список ниже показывает только
// гостей, попадающих под выбранные фильтры. Внутри одной группы фильтры
// объединяются по ИЛИ, между группами — по И.

type Attending = 'yes' | 'maybe' | 'no' | 'none'
type Transport = 'borisov' | 'minsk' | 'none' | 'unset'
type Alcohol = 'sparkling' | 'white' | 'red' | 'vodka' | 'whisky'

export interface ReportRow {
	id: string
	name: string
	people: number
	attending: Attending
	transport: Transport
	alcohol: Alcohol[]
	allergies?: string | null
}

const ATTENDING_ORDER: Attending[] = ['yes', 'maybe', 'no', 'none']
const ATTENDING_LABEL: Record<Attending, string> = {
	yes: 'Придут',
	maybe: 'Подумают',
	no: 'Не придут',
	none: 'Не ответили',
}
const ATTENDING_COLOR: Record<Attending, string> = {
	yes: 'var(--theme-success-500, #3aa657)',
	maybe: 'var(--theme-warning-500, #d9a534)',
	no: 'var(--theme-error-500, #c0413b)',
	none: 'var(--theme-elevation-400, #6a6a6a)',
}

const TRANSPORT_ORDER: Transport[] = ['borisov', 'minsk', 'none', 'unset']
const TRANSPORT_LABEL: Record<Transport, string> = {
	borisov: 'Трансфер из Борисова',
	minsk: 'Трансфер из Минска',
	none: 'Трансфер не нужен',
	unset: 'Трансфер: нет ответа',
}

const ALCOHOL_ORDER: Alcohol[] = ['sparkling', 'white', 'red', 'vodka', 'whisky']
const ALCOHOL_LABEL: Record<Alcohol, string> = {
	sparkling: 'Игристое вино',
	white: 'Белое вино',
	red: 'Красное вино',
	vodka: 'Водка',
	whisky: 'Виски',
}

const TEXT = 'var(--theme-text, #fff)'
const MUTED = 'var(--theme-elevation-650, #9a9a9a)'
const FAINT = 'var(--theme-elevation-500, #777)'
const LINE = 'var(--theme-elevation-100, #2e2e2e)'
const PANEL = 'var(--theme-elevation-0, #1b1b1b)'

function toggle<T>(set: Set<T>, v: T): Set<T> {
	const next = new Set(set)
	if (next.has(v)) next.delete(v)
	else next.add(v)
	return next
}

function sameSet<T>(a: Set<T>, b: Set<T>): boolean {
	if (a.size !== b.size) return false
	for (const v of a) if (!b.has(v)) return false
	return true
}

function StatCard({
	label,
	value,
	sub,
	active,
	accent,
	onClick,
}: {
	label: string
	value: number
	sub?: string
	active: boolean
	accent?: string
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				textAlign: 'left',
				cursor: 'pointer',
				background: active ? 'var(--theme-elevation-100, #2e2e2e)' : PANEL,
				border: `1px solid ${active ? accent || TEXT : LINE}`,
				borderRadius: 8,
				padding: '14px 16px',
				minWidth: 0,
				transition: 'border-color .15s, background .15s',
			}}
		>
			<div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: TEXT }}>{value}</div>
			<div style={{ marginTop: 4, fontSize: 12, color: MUTED }}>{label}</div>
			{sub ? <div style={{ marginTop: 2, fontSize: 11, color: FAINT }}>{sub}</div> : null}
		</button>
	)
}

function Bar({
	label,
	color,
	people,
	total,
	active,
	onClick,
}: {
	label: string
	color: string
	people: number
	total: number
	active: boolean
	onClick: () => void
}) {
	const pct = total > 0 ? Math.round((people / total) * 100) : 0
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				width: '100%',
				cursor: 'pointer',
				background: active ? 'var(--theme-elevation-100, #2e2e2e)' : 'transparent',
				border: `1px solid ${active ? color : 'transparent'}`,
				borderRadius: 6,
				padding: '6px 8px',
				transition: 'border-color .15s, background .15s',
			}}
		>
			<div style={{ width: 110, flexShrink: 0, fontSize: 13, textAlign: 'left', color: TEXT }}>{label}</div>
			<div style={{ flex: 1, height: 10, borderRadius: 6, background: LINE, overflow: 'hidden' }}>
				<div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
			</div>
			<div style={{ width: 96, flexShrink: 0, textAlign: 'right', fontSize: 13, color: MUTED }}>
				<strong style={{ color: TEXT }}>{people}</strong> чел · {pct}%
			</div>
		</button>
	)
}

function Chip({
	label,
	count,
	people,
	active,
	accent,
	onClick,
}: {
	label: string
	count: number
	people?: number
	active: boolean
	accent?: string
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				cursor: 'pointer',
				background: active ? 'var(--theme-elevation-150, #353535)' : PANEL,
				border: `1px solid ${active ? accent || TEXT : LINE}`,
				borderRadius: 999,
				padding: '6px 12px',
				fontSize: 13,
				color: TEXT,
				transition: 'border-color .15s, background .15s',
			}}
		>
			{accent ? (
				<span style={{ width: 8, height: 8, borderRadius: 999, background: accent, flexShrink: 0 }} />
			) : null}
			<span>{label}</span>
			<span style={{ color: MUTED }}>
				{people != null ? `${people} чел` : `${count}`}
			</span>
		</button>
	)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: FAINT, marginBottom: 8 }}>
			{children}
		</div>
	)
}

export function InvitesReportClient({ rows }: { rows: ReportRow[] }) {
	const [att, setAtt] = useState<Set<Attending>>(new Set())
	const [trans, setTrans] = useState<Set<Transport>>(new Set())
	const [alc, setAlc] = useState<Set<Alcohol>>(new Set())

	const totals = useMemo(() => {
		let people = 0
		const a: Record<Attending, { people: number; invites: number }> = {
			yes: { people: 0, invites: 0 },
			maybe: { people: 0, invites: 0 },
			no: { people: 0, invites: 0 },
			none: { people: 0, invites: 0 },
		}
		const tr: Record<Transport, { people: number; invites: number }> = {
			borisov: { people: 0, invites: 0 },
			minsk: { people: 0, invites: 0 },
			none: { people: 0, invites: 0 },
			unset: { people: 0, invites: 0 },
		}
		const al: Record<Alcohol, { people: number; invites: number }> = {
			sparkling: { people: 0, invites: 0 },
			white: { people: 0, invites: 0 },
			red: { people: 0, invites: 0 },
			vodka: { people: 0, invites: 0 },
			whisky: { people: 0, invites: 0 },
		}
		for (const r of rows) {
			people += r.people
			a[r.attending].people += r.people
			a[r.attending].invites += 1
			tr[r.transport].people += r.people
			tr[r.transport].invites += 1
			for (const drink of r.alcohol) {
				al[drink].people += r.people
				al[drink].invites += 1
			}
		}
		return { people, invites: rows.length, a, tr, al }
	}, [rows])

	const respondedPeople = totals.a.yes.people + totals.a.maybe.people + totals.a.no.people
	const respondedInvites = totals.a.yes.invites + totals.a.maybe.invites + totals.a.no.invites

	const filtered = useMemo(
		() =>
			rows.filter((r) => {
				if (att.size && !att.has(r.attending)) return false
				if (trans.size && !trans.has(r.transport)) return false
				if (alc.size && !r.alcohol.some((d) => alc.has(d))) return false
				return true
			}),
		[rows, att, trans, alc],
	)

	const shownPeople = filtered.reduce((s, r) => s + r.people, 0)
	const anyFilter = att.size > 0 || trans.size > 0 || alc.size > 0

	function clearAll() {
		setAtt(new Set())
		setTrans(new Set())
		setAlc(new Set())
	}

	// Карточка-ярлык над списком: задаёт точный набор статусов присутствия.
	// Повторный клик по активной карточке снимает фильтр.
	function selectAttending(target: Attending[]) {
		const set = new Set(target)
		setAtt((cur) => (sameSet(cur, set) ? new Set() : set))
	}

	return (
		<div
			style={{
				margin: '0 0 28px',
				padding: 20,
				borderRadius: 10,
				background: 'var(--theme-elevation-50, #161616)',
				border: `1px solid ${LINE}`,
			}}
		>
			{/* Карточки-ярлыки по присутствию */}
			<div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
				<StatCard
					label="Всего приглашено"
					value={totals.people}
					sub={`${totals.invites} приглашений`}
					active={!anyFilter}
					onClick={clearAll}
				/>
				<StatCard
					label="Ответили"
					value={respondedPeople}
					sub={`${respondedInvites} из ${totals.invites} приглашений`}
					active={sameSet(att, new Set<Attending>(['yes', 'maybe', 'no'])) && !trans.size && !alc.size}
					onClick={() => {
						setTrans(new Set())
						setAlc(new Set())
						selectAttending(['yes', 'maybe', 'no'])
					}}
				/>
				<StatCard
					label="Не ответили"
					value={totals.a.none.people}
					sub={`${totals.a.none.invites} приглашений`}
					accent={ATTENDING_COLOR.none}
					active={sameSet(att, new Set<Attending>(['none'])) && !trans.size && !alc.size}
					onClick={() => {
						setTrans(new Set())
						setAlc(new Set())
						selectAttending(['none'])
					}}
				/>
				<StatCard
					label="Придут"
					value={totals.a.yes.people}
					sub={`${totals.a.yes.invites} приглашений`}
					accent={ATTENDING_COLOR.yes}
					active={sameSet(att, new Set<Attending>(['yes'])) && !trans.size && !alc.size}
					onClick={() => {
						setTrans(new Set())
						setAlc(new Set())
						selectAttending(['yes'])
					}}
				/>
			</div>

			{/* Присутствие — кликабельные полосы (мультивыбор, тогл) */}
			<div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
				<SectionTitle>Присутствие</SectionTitle>
				{ATTENDING_ORDER.map((v) => (
					<Bar
						key={v}
						label={ATTENDING_LABEL[v]}
						color={ATTENDING_COLOR[v]}
						people={totals.a[v].people}
						total={totals.people}
						active={att.has(v)}
						onClick={() => setAtt((s) => toggle(s, v))}
					/>
				))}
			</div>

			{/* Трансфер */}
			<div style={{ marginTop: 18 }}>
				<SectionTitle>Трансфер</SectionTitle>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
					{TRANSPORT_ORDER.map((v) => (
						<Chip
							key={v}
							label={TRANSPORT_LABEL[v]}
							count={totals.tr[v].invites}
							people={totals.tr[v].people}
							active={trans.has(v)}
							onClick={() => setTrans((s) => toggle(s, v))}
						/>
					))}
				</div>
			</div>

			{/* Алкоголь — сколько людей предпочитают каждый вид (для закупки) */}
			<div style={{ marginTop: 18 }}>
				<SectionTitle>Алкоголь · предпочтения для закупки</SectionTitle>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
					{ALCOHOL_ORDER.map((v) => (
						<Chip
							key={v}
							label={ALCOHOL_LABEL[v]}
							count={totals.al[v].invites}
							people={totals.al[v].people}
							active={alc.has(v)}
							onClick={() => setAlc((s) => toggle(s, v))}
						/>
					))}
				</div>
			</div>

			{/* Список гостей под выбранные фильтры */}
			<div style={{ marginTop: 20, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
				<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
					<div style={{ fontSize: 13, color: TEXT }}>
						{anyFilter ? 'Подходящие гости' : 'Все гости'}:{' '}
						<strong>{filtered.length}</strong> приглашений · {shownPeople} чел
					</div>
					{anyFilter ? (
						<button
							type="button"
							onClick={clearAll}
							style={{
								cursor: 'pointer',
								background: 'transparent',
								border: `1px solid ${LINE}`,
								borderRadius: 6,
								padding: '4px 10px',
								fontSize: 12,
								color: MUTED,
							}}
						>
							Сбросить фильтры
						</button>
					) : null}
				</div>

				<div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
					{filtered.length === 0 ? (
						<div style={{ fontSize: 13, color: MUTED, padding: '12px 0' }}>Нет гостей под выбранные фильтры.</div>
					) : (
						filtered.map((r) => (
							<div
								key={r.id}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 10,
									flexWrap: 'wrap',
									background: PANEL,
									border: `1px solid ${LINE}`,
									borderRadius: 8,
									padding: '10px 12px',
								}}
							>
								<span
									title={ATTENDING_LABEL[r.attending]}
									style={{ width: 9, height: 9, borderRadius: 999, background: ATTENDING_COLOR[r.attending], flexShrink: 0 }}
								/>
								<span style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>{r.name}</span>
								<span style={{ fontSize: 12, color: MUTED }}>{r.people} чел</span>
								<span style={{ fontSize: 12, color: MUTED }}>· {ATTENDING_LABEL[r.attending]}</span>
								{r.transport !== 'unset' && r.transport !== 'none' ? (
									<span style={{ fontSize: 12, color: MUTED }}>· {TRANSPORT_LABEL[r.transport]}</span>
								) : null}
								{r.alcohol.length > 0 ? (
									<span style={{ fontSize: 12, color: FAINT }}>
										· {r.alcohol.map((d) => ALCOHOL_LABEL[d]).join(', ')}
									</span>
								) : null}
								{r.allergies ? (
									<span style={{ fontSize: 12, color: 'var(--theme-warning-500, #d9a534)' }}>· аллергия: {r.allergies}</span>
								) : null}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
