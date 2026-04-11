'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const palette = [
	{ name: 'Ivory', hex: '#FFFFF0' },
	{ name: 'Champagne', hex: '#F7E7CE' },
	{ name: 'Sage', hex: '#8B9D83' },
	{ name: 'Dusty Rose', hex: '#DCAE96' },
	{ name: 'Slate', hex: '#6B7B8D' },
]

export function DressCodeSection() {
	const t = useTranslations('dresscode')

	return (
		<section id="dresscode" className="px-8 sm:px-12 py-16">
			<Reveal>
				<SectionHeading title={t('title')} />
			</Reveal>

			<Reveal delay={0.1}>
				<p className="text-center text-sm text-ink-light font-sans leading-relaxed max-w-sm mx-auto mb-10">
					{t('description')}
				</p>
			</Reveal>

			{/* Color palette */}
			<Stagger className="flex justify-center gap-4 sm:gap-6">
				{palette.map((color) => (
					<motion.div
						key={color.name}
						variants={fadeUp}
						className="flex flex-col items-center gap-2"
					>
						<div
							className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-border-light shadow-[var(--shadow-subtle)]"
							style={{ backgroundColor: color.hex }}
						/>
						<span className="text-[10px] uppercase tracking-widest text-ink-muted font-sans hidden sm:block">
							{color.name}
						</span>
					</motion.div>
				))}
			</Stagger>
		</section>
	)
}
