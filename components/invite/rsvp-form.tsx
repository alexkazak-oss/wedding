'use client'

import type {AlcoholOption, SaveRsvpInput} from '@/lib/actions/invite'
import {saveRsvp} from '@/lib/actions/invite'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useRef, useState, useTransition} from 'react'
import {useRouter} from 'next/navigation'

type Locale = 'ru' | 'it'
type Transport = 'borisov' | 'minsk' | 'none'

export interface RsvpFormProps {
	token: string
	locale: Locale
	// Анкета уже отправлена ранее — открываем форму сразу «замороженной».
	submitted?: boolean
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
		q1: 'Будете ли Вы присутствовать?',
		attending: {
			yes: 'Конечно — да! Кто-то же должен съесть торт',
			maybe: 'Отвечу точно до 20.08.2026',
			no: 'Не смогу прийти',
		},
		q2: 'Необходим ли Вам трансфер?',
		transport: {
			borisov: 'Да, из г. Борисов',
			minsk: 'Да, из г. Минск',
			none: 'Нет',
		},
		transportHint:
			'Трансфер предоставляется в обе стороны из указанных городов. Если Вы выберете «Да», мы свяжемся с Вами дополнительно для уточнения деталей.',
		q3: 'Можете оставить свой комментарий, указать свои предпочтения или аллергии',
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
		saved: 'Сохранено ✓',
		edit: 'Изменить ответы',
		errMax: `Можно выбрать не более ${MAX_ALCOHOL} вариантов`,
	},
	it: {
		title: 'Questionario',
		q1: 'Sarai presente?',
		attending: {
			yes: 'Certo che sì! Qualcuno deve pur mangiare la torta',
			maybe: 'Risponderò entro il 20.08.2026',
			no: 'Non potrò venire',
		},
		q2: 'Hai bisogno di un transfer?',
		transport: {borisov: 'Sì, da Borisov', minsk: 'Sì, da Minsk', none: 'No'},
		transportHint:
			'Il transfer è disponibile in entrambe le direzioni dalle città indicate. Se scegli "Sì", vi contatteremo per ulteriori dettagli.',
		q3: 'Potete lasciare un commento, indicare le preferenze o allergie?',
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
		saved: 'Salvato ✓',
		edit: 'Modifica risposte',
		errMax: `Puoi scegliere al massimo ${MAX_ALCOHOL} opzioni`,
	},
} satisfies Record<Locale, Record<string, unknown>>

// Спиннер вместо подписи «Сохраняем…». Тёмно-коричневый (ink-light) на
// тёмном фоне кнопки — намеренно неконтрастный, лишь лёгкий намёк на загрузку.
// Кольцо-«трек» совсем тусклое, активная дуга — чуть плотнее.
function Spinner() {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			className='animate-spin text-ink-light'
			role='status'
			aria-label='…'
		>
			<circle
				cx='12'
				cy='12'
				r='9'
				stroke='currentColor'
				strokeWidth='2.5'
				opacity='0.25'
			/>
			<path
				d='M21 12a9 9 0 0 0-9-9'
				stroke='currentColor'
				strokeWidth='2.5'
				strokeLinecap='round'
				opacity='0.7'
			/>
		</svg>
	)
}

// Авто-высота textarea: растёт по содержимому до MAX_TEXTAREA_PX, дальше
// фиксируется и включается вертикальный скролл.
const MAX_TEXTAREA_PX = 220
function autosizeTextarea(el: HTMLTextAreaElement | null) {
	if (!el) return
	el.style.height = 'auto'
	const next = Math.min(el.scrollHeight, MAX_TEXTAREA_PX)
	el.style.height = `${next}px`
	el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_PX ? 'auto' : 'hidden'
}

const ALCOHOL_ORDER: AlcoholOption[] = [
	'sparkling',
	'white',
	'red',
	'vodka',
	'whisky',
]
const TRANSPORT_ORDER: Transport[] = ['borisov', 'minsk', 'none']
const ATTENDING_ORDER: Attending[] = ['yes', 'maybe', 'no']

export function RsvpForm({
	token,
	locale,
	submitted = false,
	initial,
}: RsvpFormProps) {
	const t = COPY[locale] ?? COPY.ru
	const router = useRouter()

	const [attending, setAttending] = useState<Attending | null>(
		initial.attending,
	)
	const [transport, setTransport] = useState<Transport | null>(
		initial.transport,
	)
	const [allergies, setAllergies] = useState(initial.allergies ?? '')
	const [alcohol, setAlcohol] = useState<AlcoholOption[]>(initial.alcohol ?? [])
	const [error, setError] = useState<string | null>(null)
	const [saved, setSaved] = useState(false)
	// Заморозка: после сохранения форма блокируется, чтобы случайно не изменить
	// ответы. Если анкета уже была отправлена ранее — стартуем сразу замороженными.
	const [locked, setLocked] = useState(submitted)
	const [pending, startTransition] = useTransition()
	const allergiesRef = useRef<HTMLTextAreaElement>(null)

	// «Сохранено ✓» показываем временно внутри кнопки, затем она становится
	// «Изменить». Таймер сбрасываем при размонтировании/повторном сохранении.
	useEffect(() => {
		if (!saved) return
		const id = setTimeout(() => setSaved(false), 1600)
		return () => clearTimeout(id)
	}, [saved])

	// Остальные вопросы показываем, только если гость придёт или ответит позже.
	// При «не смогу прийти» анкета заканчивается на первом вопросе.
	const showDetails = attending === 'yes' || attending === 'maybe'

	// Подгоняем высоту поля под текст: при вводе, при подстановке начального
	// значения и когда блок с деталями разворачивается (поле монтируется).
	useEffect(() => {
		autosizeTextarea(allergiesRef.current)
	}, [allergies, showDetails])

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

	function runSave() {
		if (locked || pending) return
		setError(null)
		const payload: SaveRsvpInput = {
			token,
			attending,
			transport,
			allergies: allergies.trim() || null,
			alcohol,
		}
		startTransition(async () => {
			const res = await saveRsvp(payload)
			if (res.ok) {
				setSaved(true)
				setLocked(true) // замораживаем форму после успешного сохранения
				router.refresh()
			} else {
				setError(res.error)
			}
		})
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		runSave()
	}

	// Разморозка по «Изменить ответы» — снова даём редактировать.
	function handleEdit() {
		setLocked(false)
		setSaved(false)
		setError(null)
	}

	// Единая кнопка действия. Всегда type="button" (не "submit"), поэтому
	// смена состояния в обработчике не вызывает случайной отправки формы.
	// Во время «Сохраняем…» и вспышки «Сохранено ✓» клики игнорируем.
	function handleAction() {
		if (pending || saved) return
		if (locked) handleEdit()
		else runSave()
	}

	const radioRow = (active: boolean, label: string, onClick: () => void) => (
		<button
			type='button'
			onClick={onClick}
			className='flex w-full items-center gap-3 py-2.5 text-left'
		>
			<span
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
					active ? 'border-ink' : 'border-border'
				}`}
			>
				{active && <span className='h-2.5 w-2.5 rounded-full bg-ink' />}
			</span>
			<span className='text-base text-ink font-sans leading-snug'>{label}</span>
		</button>
	)

	const checkRow = (active: boolean, label: string, onClick: () => void) => (
		<button
			type='button'
			onClick={onClick}
			className='flex w-full items-center gap-3 py-2.5 text-left'
		>
			<span
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
					active ? 'border-ink bg-ink text-cream' : 'border-border'
				}`}
			>
				{active && (
					<svg
						width='12'
						height='12'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='3'
					>
						<path d='M5 13l4 4L19 7' />
					</svg>
				)}
			</span>
			<span className='text-base text-ink font-sans leading-snug'>{label}</span>
		</button>
	)

	const labelCls = 'block font-serif text-lg sm:text-xl text-ink mb-2'

	return (
		<section
			id='rsvp'
			className='px-6 sm:px-12 py-14 flex flex-col items-center'
		>
			<div className='text-center mb-10'>
				<h2
					className='font-serif text-ink tracking-wide'
					style={{fontSize: 'clamp(1.75rem, 6vw, 2.5rem)'}}
				>
					{t.title}
				</h2>
			</div>

			<form onSubmit={handleSubmit} className='max-w-md mx-auto'>
				{/* Заморозка: disabled выключает все поля внутри (нельзя случайно
				    изменить), opacity даёт плавное «потускнение». Кнопка действия
				    лежит вне fieldset — остаётся кликабельной. */}
				<fieldset
					disabled={locked}
					className={`m-0 min-w-0 border-0 p-0 transition-opacity duration-500 ${
						locked ? 'opacity-60' : 'opacity-100'
					}`}
				>
					{/* Q1 */}
					<div>
						<span className={labelCls}>{t.q1}</span>
						{ATTENDING_ORDER.map((v) => (
							<div key={v}>
								{radioRow(attending === v, t.attending[v], () => {
									touch()
									setAttending(v)
									// «Не смогу прийти» — очищаем последующие ответы, анкета закрывается.
									if (v === 'no') {
										setTransport(null)
										setAllergies('')
										setAlcohol([])
										setError(null)
									}
								})}
							</div>
						))}
					</div>

					<AnimatePresence initial={false}>
						{showDetails && (
							<motion.div
								key='rsvp-details'
								initial={{height: 0, opacity: 0}}
								animate={{height: 'auto', opacity: 1}}
								exit={{height: 0, opacity: 0}}
								transition={{duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]}}
								className='overflow-hidden'
							>
								{/* pt-9 — отступ от Q1 внутри сворачиваемой области, чтобы он
						    исчезал вместе с высотой и кнопка не «прыгала». */}
								<div className='space-y-9 pt-9'>
									{/* Q2 */}
									<div>
										<span className={labelCls}>{t.q2}</span>
										{TRANSPORT_ORDER.map((v) => (
											<div key={v}>
												{radioRow(transport === v, t.transport[v], () => {
													touch()
													setTransport(v)
												})}
												{/* Пояснение к трансферу: показываем под выбранным городом
									    (borisov/minsk), но не под «Нет». Плавно разворачивается. */}
												<AnimatePresence initial={false}>
													{transport === v && v !== 'none' && (
														<motion.div
															key='transport-hint'
															initial={{height: 0, opacity: 0}}
															animate={{height: 'auto', opacity: 1}}
															exit={{height: 0, opacity: 0}}
															transition={{
																duration: 0.3,
																ease: [0.25, 0.46, 0.45, 0.94],
															}}
															className='overflow-hidden'
														>
															<p className='pt-1 pb-1.5 pl-8 text-xs text-ink-muted font-sans leading-snug'>
																{t.transportHint}
															</p>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										))}
									</div>

									{/* Q3 */}
									<div>
										<label htmlFor='rsvp-allergies' className={labelCls}>
											{t.q3}
										</label>
										<textarea
											ref={allergiesRef}
											id='rsvp-allergies'
											value={allergies}
											onChange={(e) => {
												touch()
												setAllergies(e.target.value)
												autosizeTextarea(e.currentTarget)
											}}
											rows={2}
											placeholder={t.q3ph}
											className=' w-full
  bg-transparent
  rounded-sm
  outline-none
  ring-1 ring-inset ring-neutral-300
  py-2
  text-base
  text-ink
  font-sans
  resize-none
  overflow-hidden
  max-h-[220px]
  transition-shadow
  focus:ring-2
  p-4 h-auto'
										/>
									</div>

									{/* Q4 */}
									<div>
										<span className={labelCls}>{t.q4}</span>
										<p className='text-xs text-ink-muted font-sans mb-1'>
											{t.q4hint}
										</p>
										{ALCOHOL_ORDER.map((v) => (
											<div key={v}>
												{checkRow(alcohol.includes(v), t.alcohol[v], () =>
													toggleAlcohol(v),
												)}
											</div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</fieldset>

				{/* Постоянный отступ сверху (mt-9): не зависит от наличия блока
				    деталей, поэтому при его удалении из DOM кнопка не дёргается. */}
				<div className='mt-9 space-y-4'>
					{error && (
						<p className='text-xs text-red-700/80 font-sans'>{error}</p>
					)}

					<div className='flex items-center gap-4'>
						{/* Одна кнопка с постоянным размером: состояния
						    Сохранить → спиннер → Сохранено ✓ → Изменить сменяют друг
						    друга кроссфейдом (AnimatePresence), цвет/контур морфятся
						    CSS-транзишеном. «Сохранено ✓» держится временно (useEffect). */}
						<button
							type='button'
							onClick={handleAction}
							disabled={pending}
							className={`relative rounded-sm px-8 py-3 uppercase text-xs tracking-[0.18em] font-sans border transition-colors duration-500 disabled:cursor-not-allowed ${
								locked
									? 'border-ink/40 bg-transparent text-ink hover:bg-ink/5'
									: 'border-transparent bg-ink/70 text-cream hover:bg-ink-light disabled:opacity-50'
							}`}
						>
							{/* Невидимый размерник: держит ширину/высоту по самой длинной
							    подписи, поэтому размер кнопки одинаков во всех состояниях. */}
							<span className='invisible grid' aria-hidden>
								<span className='col-start-1 row-start-1 whitespace-nowrap'>
									{t.save}
								</span>
								<span className='col-start-1 row-start-1 whitespace-nowrap'>
									{t.saved}
								</span>
								<span className='col-start-1 row-start-1 whitespace-nowrap'>
									{t.edit}
								</span>
							</span>
							{/* Видимое содержимое поверх размерника, по центру:
							    Сохранить → спиннер → Сохранено ✓ → Изменить. */}
							{/* Без mode="wait": новое содержимое появляется поверх старого
							    (оба absolute по центру), поэтому при клике «Сохранить»
							    спиннер проявляется сразу, а не после исчезновения подписи —
							    кнопка не остаётся пустой в момент запроса. */}
							<span className='absolute inset-0 overflow-hidden'>
								<AnimatePresence initial={false}>
									<motion.span
										key={
											pending
												? 'saving'
												: saved
													? 'saved'
													: locked
														? 'edit'
														: 'save'
										}
										initial={{opacity: 0, y: 8}}
										animate={{opacity: 1, y: 0}}
										exit={{opacity: 0, y: -8}}
										transition={{duration: 0.2}}
										className='absolute inset-0 flex items-center justify-center whitespace-nowrap'
									>
										{pending ? (
											<Spinner />
										) : saved ? (
											t.saved
										) : locked ? (
											t.edit
										) : (
											t.save
										)}
									</motion.span>
								</AnimatePresence>
							</span>
						</button>
					</div>
				</div>
			</form>
		</section>
	)
}
