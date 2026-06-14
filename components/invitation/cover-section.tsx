'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { AddToCalendar } from '@/components/ui/add-to-calendar'
import { Countdown } from '@/components/ui/countdown'
import { Reveal } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function CoverSection() {
	const t = useTranslations('cover')
	const loc = useTranslations('location')

	const eventTitle = `${t('name1')} & ${t('name2')}`
	const eventDescription = `${t('headline')} ${WEDDING.domain}`
	const eventLocation = `${loc('venue')}, ${loc('address')}`

	const nameClass = cn(
		'font-serif font-light text-ink uppercase leading-[0.95]',
		'tracking-[0.01em] whitespace-nowrap',
	)
	// Размер имён считается от ширины блока (cqi), а не вьюпорта — поэтому самое
	// длинное имя гарантированно помещается в строку на любом устройстве.
	const nameStyle = { fontSize: 'clamp(1.75rem, 14cqi, 4.5rem)' } as const

	return (
		<section className="relative bg-cream min-h-svh flex flex-col overflow-hidden">
			{/* Верхняя панель: «Добавить в календарь» слева, языки справа */}
			<div className="safe-top safe-x relative z-30 flex items-center justify-between gap-3">
				<AddToCalendar
					title={eventTitle}
					description={eventDescription}
					location={eventLocation}
					startDate={WEDDING.dateIso}
					endDate={WEDDING.endDateIso}
				/>
				<LocaleSwitcher />
			</div>

			<div className="flex-1 flex flex-col px-5 xs:px-6 sm:px-10">
				{/* Дата 08 / 09 / 26 */}
				<Reveal delay={0.05}>
					<div
						className="mt-6 sm:mt-10 font-serif font-semibold text-ink leading-[1.08] tracking-[0.08em]"
						style={{ fontSize: 'clamp(1.4rem, 6.5vw, 2rem)' }}
					>
						<div>{t('day')}</div>
						<div>{t('month')}</div>
						<div>{t('year')}</div>
					</div>
				</Reveal>

				{/* Контент с вертикальной линией слева */}
				<div className="relative mt-4 flex-1 flex flex-col pl-5 xs:pl-6 sm:pl-9">
					<span
						aria-hidden="true"
						className="absolute left-0 top-0 bottom-6 w-px bg-ink/35"
					/>

					<div className="flex-1 flex flex-col justify-center">
						{/* Имена */}
						<div className="text-left" style={{ containerType: 'inline-size' }}>
							<Reveal delay={0.1}>
								<h1 className={nameClass} style={nameStyle}>
									{t('name2')}
								</h1>
							</Reveal>

							<Reveal delay={0.16}>
								<p
									className="font-signature text-ink/80 leading-none my-1 sm:my-2 pl-1"
									style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)' }}
									aria-hidden="true"
								>
									{t('and')}
								</p>
							</Reveal>

							<Reveal delay={0.22}>
								<h1 className={nameClass} style={nameStyle}>
									{t('name1')}
								</h1>
							</Reveal>
						</div>

						{/* Приглашение */}
						<Reveal delay={0.3}>
							<p
								className="mt-8 sm:mt-10 max-w-xs uppercase text-ink-light font-sans leading-[1.7]"
								style={{ fontSize: 'clamp(0.62rem, 2.7vw, 0.78rem)', letterSpacing: '0.12em' }}
							>
								{t('invitation')}
							</p>
						</Reveal>

						{/* Полная дата */}
						<Reveal delay={0.36}>
							<p
								className="mt-6 uppercase font-sans font-semibold text-ink"
								style={{ fontSize: 'clamp(0.7rem, 3vw, 0.85rem)', letterSpacing: '0.1em' }}
							>
								{t('dateFull')}
							</p>
						</Reveal>

						{/* Площадка */}
						<Reveal delay={0.42}>
							<p className="mt-2 font-sans text-ink-muted" style={{ fontSize: 'clamp(0.7rem, 3vw, 0.8rem)' }}>
								{eventLocation}
							</p>
						</Reveal>

						{/* Строка-обращение */}
						<Reveal delay={0.48}>
							<p
								className="mt-6 font-serif text-ink-light leading-[1.8]"
								style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}
							>
								{t('scriptLine')}
							</p>
						</Reveal>
					</div>

					{/* Обратный отсчёт */}
					<Reveal delay={0.54}>
						<div className="mt-20 pb-2 flex flex-col items-center text-ink-light" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
							<Countdown target={WEDDING.dateIso} showWeeks />
						</div>
					</Reveal>
				</div>
			</div>

			
		</section>
	)
}
