'use client'

import { Reveal } from '@/components/ui/reveal'
import { useTranslations } from 'next-intl'

interface GreetingSectionProps {
	overrideTitle?: string | null
	overrideText?: string | null
	/** Число гостей в приглашении — для формы обращения (1 → «ты/te», >1 → «вы/voi»). */
	guestCount?: number
}

export function GreetingSection({
	overrideTitle,
	overrideText,
	guestCount = 1,
}: GreetingSectionProps = {}) {
	const t = useTranslations('greeting')

	const title = overrideTitle?.trim() || t('title')
	const text = overrideText?.trim() || t('text', { count: guestCount })

	return (
		<section id="greeting" className="px-6 sm:px-12 py-14 text-center">
			<Reveal>
				<h2 className="font-serif font-semibold text-2xl sm:text-5xl text-ink tracking-wide">
					{title}
				</h2>
			</Reveal>
			<Reveal delay={0.1}>
				<p className="mt-5 max-w-md  mx-auto text-xl sm:text-2xl text-ink-light font-serif leading-[1.8]">
					{text}
				</p>
			</Reveal>
		</section>
	)
}
