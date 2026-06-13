'use client'

import { Reveal } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function FooterSection() {
	const cover = useTranslations('cover')
	const t = useTranslations()

	return (
		<footer className="px-6 sm:px-12 pt-10 pb-14 text-center safe-x"
			style={{ paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom))' }}
		>
			<Reveal variant="fadeIn">
				<p className="font-signature text-ink leading-[1.05]" style={{ fontSize: 'clamp(2.75rem, 11vw, 4.5rem)' }}>
					{t('signature')}
				</p>

				<div className="mt-7 flex items-center justify-center gap-3">
					<span className="h-px w-10 bg-ink/30" />
					<p className="font-serif text-base text-ink tracking-wider">
						{cover('bride')} <span className="font-script text-xl align-middle">{cover('and')}</span> {cover('groom')}
					</p>
					<span className="h-px w-10 bg-ink/30" />
				</div>

				<p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-ink-muted font-sans">
					{WEDDING.domain}
				</p>
			</Reveal>
		</footer>
	)
}
