'use client'

import { Reveal } from '@/components/ui/reveal'
import { useTranslations } from 'next-intl'

export function GreetingSection() {
	const t = useTranslations('greeting')

	return (
		<section id="greeting" className="px-6 sm:px-12 py-14 text-center">
			<Reveal>
				<h2 className="font-serif font-semibold text-2xl sm:text-3xl text-ink tracking-wide">
					{t('title')}
				</h2>
			</Reveal>

			<Reveal delay={0.1}>
				<p className="mt-5 max-w-md mx-auto text-sm sm:text-base text-ink-light font-sans leading-[1.8]">
					{t('text')}
				</p>
			</Reveal>
		</section>
	)
}
