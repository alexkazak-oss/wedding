'use client'

import { Reveal } from '@/components/ui/reveal'
import { useTranslations } from 'next-intl'

export function FooterSection() {
	const t = useTranslations('footer')

	return (
		<footer className="px-8 sm:px-12 py-12 text-center">
			<Reveal variant="fadeIn">
				<div className="space-y-4">
					<div className="text-gold-light text-sm tracking-[0.5em]">✦</div>
					<p className="font-serif text-xl text-ink tracking-wide">
						Alessandro & Anastasia
					</p>
					<p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted font-sans">
						{t('with_love')}
					</p>
				</div>
			</Reveal>
		</footer>
	)
}
