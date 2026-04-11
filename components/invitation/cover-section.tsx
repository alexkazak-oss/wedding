'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { Divider } from '@/components/ui/divider'
import { Reveal } from '@/components/ui/reveal'
import { useTranslations } from 'next-intl'

export function CoverSection() {
	const t = useTranslations('cover')

	return (
		<section className="relative flex flex-col items-center justify-center text-center px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 min-h-[80vh] sm:min-h-[600px]">
			{/* Language switcher */}
			<div className="absolute top-6 right-6">
				<LocaleSwitcher />
			</div>

			{/* Top ornament */}
			<Reveal variant="fadeIn">
				<div className="text-gold-light text-2xl mb-8 tracking-[0.5em]">✦ ✦ ✦</div>
			</Reveal>

			{/* Wedding of label */}
			<Reveal variant="fadeIn" delay={0.1}>
				<p className="text-xs uppercase tracking-[0.3em] text-ink-muted font-sans mb-6">
					{t('weddingOf')}
				</p>
			</Reveal>

			{/* Names */}
			<Reveal delay={0.2}>
				<h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-ink leading-[1.1] tracking-wide">
					Alessandro
				</h1>
			</Reveal>

			<Reveal delay={0.3}>
				<p className="font-serif text-3xl sm:text-4xl text-gold my-3 font-light">
					{t('and')}
				</p>
			</Reveal>

			<Reveal delay={0.4}>
				<h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-ink leading-[1.1] tracking-wide">
					Anastasia
				</h1>
			</Reveal>

			{/* Date */}
			<Reveal delay={0.5}>
				<div className="mt-10">
					<Divider ornament className="py-6" />
					<p className="text-sm uppercase tracking-[0.25em] text-ink-light font-sans">
						{t('date')}
					</p>
				</div>
			</Reveal>

			{/* Invitation text */}
			<Reveal delay={0.6}>
				<p className="mt-8 text-ink-muted text-sm leading-relaxed font-sans whitespace-pre-line max-w-xs">
					{t('invitation')}
				</p>
			</Reveal>

			{/* Scroll hint */}
			<Reveal delay={0.8} variant="fadeIn">
				<div className="mt-12 animate-bounce">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
						className="text-ink-muted/40"
					>
						<path d="M12 5v14M19 12l-7 7-7-7" />
					</svg>
				</div>
			</Reveal>
		</section>
	)
}
