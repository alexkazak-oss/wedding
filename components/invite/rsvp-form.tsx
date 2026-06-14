'use client'

import type { AlcoholOption, SaveRsvpInput } from '@/lib/actions/invite'
import { saveRsvp } from '@/lib/actions/invite'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Locale = 'ru' | 'it'
type Transport = 'borisov' | 'minsk' | 'none'

export interface RsvpFormProps {
	token: string
	locale: Locale
	initial: {
		attending: Attending | null
		transport: Transport | null
		allergies: string | null
		alcohol: AlcoholOption[]
	}
}

type Attending = 'yes' | 'maybe' | 'no'

const MAX_ALCOHOL = 3

const COPY = {
	ru: {
		title: 'Анкета гостя',
		subtitle: 'Пожалуйста, заполните — это поможет нам всё подготовить.',
		q1: 'Будете ли Вы присутствовать?',
		attending: {
			yes: 'Конечно — да! Кто-то же должен съесть торт',
			maybe: 'Возможно приду',
			no: 'Не смогу прийти',
		},
		q2: 'Необходим ли Вам трансфер?',
		transport: { borisov: 'Да, из г. Борисов', minsk: 'Да, из г. Минск', none: 'Нет' },
		q3: 'Пожалуйста, уточните, есть ли у Вас пищевая аллергия',
		q3ph: 'Например: орехи, морепродукты… (или оставьте пустым)',
		q4: 'Какой алкоголь предпочитаете?',
		q4hint: 'Можно выбрать 2–3 варианта',
		alcohol: {
			sparkling: 'Игристое вино',
			white: 'Белое вино',
			red: 'Красное вино',
			vodka: 'Водка',
			whisky: 'Виски',
		},
		save: 'Сохранить',
		saving: 'Сохраняем…',
		saved: 'Сохранено ✓',
		edit: 'Изменить ответы',
		errMax: `Можно выбрать не более ${MAX_ALCOHOL} вариантов`,
	},
	it: {
		title: 'Questionario',
		subtitle: 'Compila per favore — ci aiuterà a organizzare tutto.',
		q1: 'Sarai presente?',
		attending: {
			yes: 'Certo che sì! Qualcuno deve pur mangiare la torta',
			maybe: 'Forse verrò',
			no: 'Non potrò venire',
		},
		q2: 'Hai bisogno di un transfer?',
		transport: { borisov: 'Sì, da Borisov', minsk: 'Sì, da Minsk', none: 'No' },
		q3: 'Indica se hai allergie alimentari',
		q3ph: 'Es.: noci, frutti di mare… (oppure lascia vuoto)',
		q4: 'Quale alcol preferisci?',
		q4hint: 'Puoi scegliere 2–3 opzioni',
		alcohol: {
			sparkling: 'Spumante',
			white: 'Vino bianco',
			red: 'Vino rosso',
			vodka: 'Vodka',
			whisky: 'Whisky',
		},
		save: 'Salva',
		saving: 'Salvataggio…',
		saved: 'Salvato ✓',
		edit: 'Modifica risposte',
		errMax: `Puoi scegliere al massimo ${MAX_ALCOHOL} opzioni`,
	},
} satisfies Record<Locale, Record<string, unknown>>

const ALCOHOL_ORDER: AlcoholOption[] = ['sparkling', 'white', 'red', 'vodka', 'whisky']
const TRANSPORT_ORDER: Transport[] = ['borisov', 'minsk', 'none']
const ATTENDING_ORDER: Attending[] = ['yes', 'maybe', 'no']

export function RsvpForm({ token, locale, initial }: RsvpFormProps) {
	const t = COPY[locale] ?? COPY.ru
	const router = useRouter()

	const [attending, setAttending] = useState<Attending | null>(initial.attending)
	const [transport, setTransport] = useState<Transport | null>(initial.transport)
	const [allergies, setAllergies] = useState(initial.allergies ?? '')
	const [alcohol, setAlcohol] = useState<AlcoholOption[]>(initial.alcohol ?? [])
	const [error, setError] = useState<string | null>(null)
	const [saved, setSaved] = useState(false)
	const [pending, startTransition] = useTransition()

	function touch() {
		if (saved) setSaved(false)
		if (error) setError(null)
	}

	function toggleAlcohol(value: AlcoholOption) {
		touch()
		setAlcohol((prev) => {
			if (prev.includes(value)) return prev.filter((v) => v !== value)
			if (prev.length >= MAX_ALCOHOL) {
				setError(t.errMax)
				return prev
			}
			return [...prev, value]
		})
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		const payload: SaveRsvpInput = { token, attending, transport, allergies: allergies.trim() || null, alcohol }
		startTransition(async () => {
			const res = await saveRsvp(payload)
			if (res.ok) {
				setSaved(true)
				router.refresh()
			} else {
				setError(res.error)
			}
		})
	}

	const radioRow = (active: boolean, label: string, onClick: () => void) => (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center gap-3 py-2.5 text-left"
		>
			<span
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
					active ? 'border-ink' : 'border-border'
				}`}
			>
				{active && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
			</span>
			<span className="text-base text-ink font-sans leading-snug">{label}</span>
		</button>
	)

	const checkRow = (active: boolean, label: string, onClick: () => void) => (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center gap-3 py-2.5 text-left"
		>
			<span
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
					active ? 'border-ink bg-ink text-cream' : 'border-border'
				}`}
			>
				{active && (
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
						<path d="M5 13l4 4L19 7" />
					</svg>
				)}
			</span>
			<span className="text-base text-ink font-sans leading-snug">{label}</span>
		</button>
	)

	const labelCls = 'block font-serif text-lg sm:text-xl text-ink mb-2'

	return (
		<section id="rsvp" className="px-6 sm:px-12 py-14">
			<div className="text-center mb-10">
				<h2
					className="font-serif text-ink tracking-wide"
					style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)' }}
				>
					{t.title}
				</h2>
				<p className="mt-3 text-sm text-ink-light font-sans">{t.subtitle}</p>
			</div>

			<form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-9">
				{/* Q1 */}
				<div>
					<span className={labelCls}>{t.q1}</span>
					{ATTENDING_ORDER.map((v) =>
						<div key={v}>{radioRow(attending === v, t.attending[v], () => {
							touch()
							setAttending(v)
						})}</div>,
					)}
				</div>

				{/* Q2 */}
				<div>
					<span className={labelCls}>{t.q2}</span>
					{TRANSPORT_ORDER.map((v) =>
						<div key={v}>{radioRow(transport === v, t.transport[v], () => {
							touch()
							setTransport(v)
						})}</div>,
					)}
				</div>

				{/* Q3 */}
				<div>
					<label htmlFor="rsvp-allergies" className={labelCls}>
						{t.q3}
					</label>
					<textarea
						id="rsvp-allergies"
						value={allergies}
						onChange={(e) => {
							touch()
							setAllergies(e.target.value)
						}}
						rows={2}
						placeholder={t.q3ph}
						className="w-full bg-transparent border-0 border-b border-border focus:border-ink outline-none py-2 text-base text-ink font-sans resize-none"
					/>
				</div>

				{/* Q4 */}
				<div>
					<span className={labelCls}>{t.q4}</span>
					<p className="text-xs text-ink-muted font-sans mb-1">{t.q4hint}</p>
					{ALCOHOL_ORDER.map((v) =>
						<div key={v}>{checkRow(alcohol.includes(v), t.alcohol[v], () => toggleAlcohol(v))}</div>,
					)}
				</div>

				{error && <p className="text-xs text-red-700/80 font-sans">{error}</p>}

				<div className="flex items-center gap-4 pt-2">
					<button
						type="submit"
						disabled={pending}
						className="px-8 py-3 bg-ink text-cream uppercase text-xs tracking-[0.18em] font-sans hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{pending ? t.saving : saved ? t.saved : t.save}
					</button>
					{saved && !pending && (
						<span className="text-sm text-ink-light font-sans">{t.edit}</span>
					)}
				</div>
			</form>
		</section>
	)
}
