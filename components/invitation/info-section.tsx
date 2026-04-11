'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Locale } from '@/types'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'

interface InfoItem {
	icon: string
	title_ru: string
	title_it: string
	text_ru: string
	text_it: string
}

const infoItems: InfoItem[] = [
	{
		icon: '🚗',
		title_ru: 'Трансфер',
		title_it: 'Transfer',
		text_ru: 'Мы организуем трансфер от отеля до места проведения и обратно.',
		text_it: 'Organizzeremo il transfer dall\'hotel alla location e ritorno.',
	},
	{
		icon: '🏨',
		title_ru: 'Проживание',
		title_it: 'Alloggio',
		text_ru: 'Для гостей забронирован блок номеров в ближайшем отеле.',
		text_it: 'Abbiamo riservato un blocco di camere nell\'hotel più vicino.',
	},
	{
		icon: '📱',
		title_ru: 'Контакт',
		title_it: 'Contatto',
		text_ru: 'По любым вопросам пишите нам в личном кабинете.',
		text_it: 'Per qualsiasi domanda scriveteci nel vostro account personale.',
	},
]

export function InfoSection() {
	const t = useTranslations('info')
	const locale = useLocale() as Locale

	return (
		<section id="info" className="px-8 sm:px-12 py-16">
			<Reveal>
				<SectionHeading title={t('title')} />
			</Reveal>

			<Stagger className="max-w-md mx-auto space-y-6">
				{infoItems.map((item, index) => (
					<motion.div
						key={index}
						variants={fadeUp}
						className="flex gap-4 items-start"
					>
						<span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
						<div>
							<h4 className="font-serif text-base text-ink">
								{locale === 'ru' ? item.title_ru : item.title_it}
							</h4>
							<p className="text-xs text-ink-muted font-sans mt-1 leading-relaxed">
								{locale === 'ru' ? item.text_ru : item.text_it}
							</p>
						</div>
					</motion.div>
				))}
			</Stagger>
		</section>
	)
}
