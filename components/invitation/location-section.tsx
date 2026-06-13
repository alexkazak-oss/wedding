'use client'

import { Reveal } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function LocationSection() {
	const t = useTranslations('location')

	return (
		<section id="location" className="px-6 sm:px-12 py-14 text-center">
			<Reveal>
				<p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-ink-muted font-sans">
					{t('title')}
				</p>
			</Reveal>

			<Reveal delay={0.1}>
				<h3 className="mt-4 font-serif text-3xl sm:text-4xl text-ink tracking-[0.05em]">
					{t('venue')}
				</h3>
			</Reveal>

			<Reveal delay={0.18}>
				<p className="mt-3 text-sm text-ink-light font-sans">
					{t('address')}
				</p>
			</Reveal>

			<Reveal delay={0.26}>
				<a
					href={WEDDING.mapUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 mt-7 rounded-full border border-ink/70 px-5 py-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-ink font-sans hover:bg-ink hover:text-cream transition-colors"
				>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
					{t('mapButton')}
				</a>
			</Reveal>
		</section>
	)
}
