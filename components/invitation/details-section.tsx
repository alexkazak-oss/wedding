'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

// 6 цветов (не 8 — иначе на мобильном последний кружок переносится на новую строку).
const palette = [
  { name: 'Soft Pastel Yellow', hex: '#F0E6B3' },
  { name: 'Muted Sage', hex: '#B4B492' },
  { name: 'Olive Branch', hex: '#6B6B49' },
  { name: 'Marron Terracotta', hex: '#855443' },
  { name: 'Soft Peach', hex: '#F6B58B' },
  { name: 'Dusty Rose', hex: '#FAD6D8' }
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
				<div className="flex flex-col items-center gap-5">

				<p className="mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('dresscodeText')}
				</p>
				<p className="mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('dresscodeStyleText')}
				</p>
				</div>
			</Reveal>

			{/* Color palette */}
			<Stagger className="my-7 flex flex-wrap justify-center gap-3 sm:gap-4">
				{palette.map((c) => (
					<motion.div
						key={c.name}
						variants={fadeUp}
						className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-border-light shadow-(--shadow-subtle)"
						style={{ backgroundColor: c.hex }}
						aria-label={c.name}
					/>
				))}
			</Stagger>

			{/* Gifts */}
			<Reveal delay={0.2}>
				<div className="flex flex-col items-center gap-5">

				<p className="mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('giftsText')}
				</p>
				<p className="mx-auto max-w-md text-sm text-ink-light font-sans leading-[1.8]">
					{t('giftsText2')}
				</p>
				</div>
			</Reveal>

			{/* Organizer */}
			<Reveal delay={0.26}>
				<div className="mt-12 mx-auto max-w-md">
					<p className="text-sm text-ink-light font-sans leading-[1.8]">
						{t('organizerIntro')}{' '}
						<a
							href={WEDDING.organizer.channel}
							target="_blank"
							rel="noopener noreferrer"
							className="font-serif text-ink text-base italic underline underline-offset-4 decoration-ink/40 hover:decoration-ink transition-colors"
						>
							{t('organizerName')}
						</a>
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

			{/* Общий чат гостей */}
			{WEDDING.guestChatTelegram ? (
				<Reveal delay={0.28}>
					<div className="mt-12 mx-auto max-w-md">
						<p className="text-sm text-ink-light font-sans leading-[1.8]">
							{t('guestChatText')}
						</p>
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
					</div>
				</Reveal>
			) : null}

			{/* Уведомление о присутствии */}
			<Reveal delay={0.34}>
				<div className="mt-12 mx-auto max-w-md">
					<p className="font-serif italic text-base sm:text-lg text-ink leading-[1.6]">
						{t('callbackMessage')}
					</p>
				</div>
			</Reveal>
		</section>
	)
}
