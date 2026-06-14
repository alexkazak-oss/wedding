'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

// 7 цветов (не 8 — иначе на мобильном последний кружок переносится на новую строку).
// Порядок при желании можно поменять позже.
const palette = [
	{ name: 'Pastel Yellow', hex: '#EFE6B4' },
	{ name: 'Winter Pear', hex: '#B3B490' },
	{ name: 'Peach Cobbler', hex: '#F4B58A' },
	{ name: 'Olive Branch', hex: '#6A6A48' },
	{ name: 'Dusty Rose', hex: '#B37D7F' },
	{ name: 'Morron Terracotta', hex: '#845540' },
	{ name: 'Chocolate Lab', hex: '#573F36' },
]

export function DetailsSection() {
	const t = useTranslations('details')

	return (
		<section id="details" className="px-6 sm:px-12 py-14 text-center flex flex-col items-center gap-10">
			{/* Dress code */}
			<Reveal delay={0.1}>
				<h3 className=" font-serif font-semibold text-xl sm:text-2xl text-ink tracking-wide">
					{t('dresscodeTitle')}
				</h3>
			</Reveal>

			<Reveal delay={0.18}>
				<p className="mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('dresscodeText')}
				</p>
			</Reveal>

			{/* Color palette */}
			<Stagger className="mt-7 flex flex-wrap justify-center gap-3 sm:gap-4">
				{palette.map((c) => (
					<motion.div
						key={c.name}
						variants={fadeUp}
						className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-border-light shadow-[var(--shadow-subtle)]"
						style={{ backgroundColor: c.hex }}
						aria-label={c.name}
					/>
				))}
			</Stagger>

			{/* Gifts */}
			<Reveal delay={0.2}>
				<p className="mt-12 mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('giftsText')}
				</p>
				<p className="mt-4 mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('giftsText2')}
				</p>
			</Reveal>

			{/* Organizer */}
			<Reveal delay={0.26}>
				<div className="mt-12 mx-auto max-w-md">
					<p className="text-sm text-ink-light font-sans leading-[1.8]">
						{t('organizerIntro')}{' '}
						<span className="font-serif text-ink text-base italic">{t('organizerName')}</span>
					</p>
					<div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
						<a
							href={`tel:${WEDDING.organizer.phone.replace(/\s/g, '')}`}
							className="inline-flex items-center gap-2 text-sm font-sans text-ink hover:text-ink-light transition-colors break-all"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z" />
							</svg>
							{WEDDING.organizer.phone}
						</a>
						<a
							href={WEDDING.organizer.telegram}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-sm font-sans text-ink hover:text-ink-light transition-colors"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
								<path d="M21.95 4.5 18.4 19.83c-.27 1.17-.97 1.47-1.97.92l-5.45-4.02-2.63 2.54c-.29.29-.54.54-1.1.54l.4-5.58 10.16-9.18c.44-.4-.1-.62-.69-.22L4.55 11.35-.86 9.66c-1.17-.37-1.2-1.17.25-1.73L20.37 2.78c.97-.36 1.83.22 1.58 1.72z" />
							</svg>
							{WEDDING.organizer.telegramLabel}
						</a>
					</div>
				</div>
			</Reveal>

			{/* Уведомление о присутствии + чат гостей */}
			<Reveal delay={0.3}>
				<div className="mt-12 mx-auto max-w-md">
					<p className="font-serif italic text-base sm:text-lg text-ink leading-[1.6]">
						{t('callbackMessage')}
					</p>
					{WEDDING.guestChatTelegram ? (
						<a
							href={WEDDING.guestChatTelegram}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-sans hover:bg-ink-light transition-colors"
						>
							<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
								<path d="M21.95 4.5 18.4 19.83c-.27 1.17-.97 1.47-1.97.92l-5.45-4.02-2.63 2.54c-.29.29-.54.54-1.1.54l.4-5.58 10.16-9.18c.44-.4-.1-.62-.69-.22L4.55 11.35-.86 9.66c-1.17-.37-1.2-1.17.25-1.73L20.37 2.78c.97-.36 1.83.22 1.58 1.72z" />
							</svg>
							{t('guestChatLabel')}
						</a>
					) : null}
				</div>
			</Reveal>
		</section>
	)
}
