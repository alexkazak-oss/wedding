'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface TimingEntry {
	time: string
	label: string
}

export function TimingSection() {
	const t = useTranslations('timing')
	const items = t.raw('items') as TimingEntry[]

	return (
		<section id="timing" className="px-6 sm:px-12 py-14 text-center items-center flex flex-col">
			<Reveal>
				<p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-ink-muted font-sans">
					{t('title')}
				</p>
			</Reveal>

			<Stagger className="mx-auto mt-8 max-w-sm space-y-5">
				{items.map((item) => (
					<motion.div
						key={item.time}
						variants={fadeUp}
						className="grid grid-cols-[auto_1.5rem_1fr] items-center gap-3 sm:gap-5"
					>
						<span className="font-serif text-2xl text-ink tabular-nums font-light text-right">
							{item.time}
						</span>
						<span className="h-px bg-ink/30" />
						<span className="text-sm text-ink-light font-sans text-left">
							{item.label}
						</span>
					</motion.div>
				))}
			</Stagger>
		</section>
	)
}
