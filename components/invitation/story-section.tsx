'use client'

import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { useTranslations } from 'next-intl'

export function StorySection() {
	const t = useTranslations('story')

	return (
		<section id="story" className="px-8 sm:px-12 py-16">
			<Reveal>
				<SectionHeading title={t('title')} />
			</Reveal>

			<Reveal delay={0.15}>
				<div className="max-w-md mx-auto text-center">
					<p className="text-ink-light text-sm leading-[1.8] font-sans">
						{t('text')}
					</p>
				</div>
			</Reveal>
		</section>
	)
}
