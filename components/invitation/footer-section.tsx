'use client'

import {Reveal} from '@/components/ui/reveal'
import {WEDDING} from '@/lib/constants'
import {useTranslations} from 'next-intl'

export function FooterSection() {
	const cover = useTranslations('cover')
	const t = useTranslations()

	return (
		<footer
			className='px-6 sm:px-12  text-center safe-x'
			style={{paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom))'}}
		>
			<Reveal variant='fadeIn'>
				<div className='flex items-center justify-center my-12'>

				<p
					className='font-signature text-ink leading-[1.05] flex items-center justify-center text-center wrap-break-word'
					style={{fontSize: 'clamp(2.75rem, 11vw, 4.5rem)'}}
				>
					{t('signature')}
				</p>
				</div>

				<div className='mt-7 flex items-center justify-center gap-6'>
					<span className='h-px w-8 md:w-20 shrink-0 bg-ink/30' />

					<p className='flex items-center gap-2 whitespace-nowrap font-serif text-base leading-none text-ink tracking-wider'>
						<span className='leading-none'>{cover('bride')}</span>

						<span className='font-signature text-xl leading-none'>
							{cover('and')}
						</span>

						<span className='leading-none'>{cover('groom')}</span>
					</p>

					<span className='h-px w-8 md:w-20 shrink-0 bg-ink/30' />
				</div>

				<p className='mt-3 text-[10px] uppercase tracking-[0.3em] text-ink-muted font-sans'>
					{WEDDING.domain}
				</p>
			</Reveal>
		</footer>
	)
}
