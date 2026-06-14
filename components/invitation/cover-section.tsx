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
		<section className="relative bg-cream">
			{/* Top bar — safe-area aware */}
			<div className="safe-top safe-x absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 mt-5 md:mt-8 mx-6">
				<AddToCalendar
					title={eventTitle}
					description={eventDescription}

					location={eventLocation}
					startDate={WEDDING.dateIso}
					endDate={WEDDING.endDateIso}
				/>
				<LocaleSwitcher />
			</div>

			<div className="relative px-5 xs:px-6 sm:px-12 pt-[clamp(4.5rem,18vw,6.5rem)] pb-12 sm:pb-14">


				{/* Names */}
				<div className="mt-8 sm:mt-14 text-center">
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
							className="font-signature text-ink/85 leading-none my-1 sm:my-2"
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
						className="mt-9 sm:mt-10 text-center font-serif font-semibold text-ink tracking-wide"
						style={{ fontSize: 'clamp(1.5rem, 5.5vw, 1.875rem)' }}
					>
						{t('headline')}
					</p>
				</Reveal>

				{/* Date 08.09.2026 */}
				<Reveal delay={0.34}>
					<p
						className="mt-3 text-center text-ink-light font-sans"
						style={{ fontSize: 'clamp(0.8rem, 3.2vw, 1rem)', letterSpacing: '0.28em' }}
					>
						{t('dateShort')}
					</p>
				</Reveal>

				{/* Countdown */}
				<Reveal delay={0.42}>
					<div className="mt-10 sm:mt-12">
						<Countdown target={WEDDING.dateIso} />
					</div>
				</Reveal>
			</div>
		</section>
	)
}
