'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { AddToCalendar } from '@/components/ui/add-to-calendar'
import { Countdown } from '@/components/ui/countdown'
import { Reveal } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function CoverSection() {
	const t = useTranslations('cover')
	const loc = useTranslations('location')

	const eventTitle = `${t('bride')} & ${t('groom')}`
	const eventDescription = `${t('headline')} ${WEDDING.domain}`
	const eventLocation = `${loc('venue')}, ${loc('address')}`

	return (
		<section className="relative bg-cream min-h-svh flex flex-col">
			<div className="safe-top safe-x relative z-10 flex items-start justify-between gap-3 mt-5 md:mt-8 mx-6">
				<div className="flex flex-col items-start gap-4 border-l border-ink/30 pl-8 leading-none font-sans text-ink/70 text-xl tracking-[0.22em] py-12">
					<span>{t('day')}</span>
					<span>{t('month')}</span>
					<span>{t('year')}</span>
				</div>

				<div className="flex items-center gap-3">
					<AddToCalendar
						title={eventTitle}
						description={eventDescription}
						location={eventLocation}
						startDate={WEDDING.dateIso}
						endDate={WEDDING.endDateIso}
					/>
					<LocaleSwitcher />
				</div>
			</div>

			<div className="relative flex-1 flex flex-col justify-center px-5 xs:px-6 sm:px-12 sm:py-16">
				{/* Names */}
				<div className="text-center">
					<Reveal delay={0.05}>
						<h1
							className="font-serif font-light text-ink tracking-[0.01em] leading-[1.02] wrap-break-word"
							style={{ fontSize: 'clamp(2rem, 9.5vw, 4.5rem)' }}
						>
							{t('bride')}
						</h1>
					</Reveal>

					<Reveal delay={0.12}>
						<p
							className="font-signature text-ink/85 leading-none my-3 sm:my-4"
							style={{ fontSize: 'clamp(1.75rem, 7vw, 2.5rem)' }}
							aria-hidden="true"
						>
							{t('and')}
						</p>
					</Reveal>

					<Reveal delay={0.18}>
						<h1
							className="font-serif font-light text-ink tracking-[0.01em] leading-[1.02] wrap-break-word"
							style={{ fontSize: 'clamp(2rem, 9.5vw, 4.5rem)' }}
						>
							{t('groom')}
						</h1>
					</Reveal>
				</div>

				{/* "Мы женимся!" — bold */}
				<Reveal delay={0.28}>
					<p
						className="mt-14 sm:mt-16 text-center font-serif font-semibold text-ink tracking-wide"
						style={{ fontSize: 'clamp(1.5rem, 5.5vw, 1.875rem)' }}
					>
						{t('headline')}
					</p>
				</Reveal>

				{/* Date 08.09.2026 */}
				<Reveal delay={0.34}>
					<p
						className="mt-4 text-center text-ink-light font-sans"
						style={{ fontSize: 'clamp(0.8rem, 3.2vw, 1rem)', letterSpacing: '0.28em' }}
					>
						{t('dateShort')}
					</p>
				</Reveal>

				{/* Countdown */}
				<Reveal delay={0.42}>
					<div className="mt-14 sm:mt-16">
						<Countdown target={WEDDING.dateIso} />
					</div>
				</Reveal>
			</div>
		</section>
	)
}
