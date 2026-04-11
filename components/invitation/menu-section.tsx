'use client'

import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Locale } from '@/types'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'

interface MenuEntry {
	name_ru: string
	name_it: string
	description_ru: string | null
	description_it: string | null
}

interface MenuCategory {
	category_ru: string
	category_it: string
	items: MenuEntry[]
}

const menuData: MenuCategory[] = [
	{
		category_ru: 'Закуски',
		category_it: 'Antipasti',
		items: [
			{ name_ru: 'Капрезе с буратой', name_it: 'Caprese con burrata', description_ru: 'Томаты, бурата, базилик', description_it: 'Pomodori, burrata, basilico' },
			{ name_ru: 'Карпаччо из лосося', name_it: 'Carpaccio di salmone', description_ru: 'С каперсами и лимоном', description_it: 'Con capperi e limone' },
		],
	},
	{
		category_ru: 'Основные блюда',
		category_it: 'Secondi',
		items: [
			{ name_ru: 'Филе миньон', name_it: 'Filetto mignon', description_ru: 'С трюфельным соусом', description_it: 'Con salsa al tartufo' },
			{ name_ru: 'Сибас на гриле', name_it: 'Branzino alla griglia', description_ru: 'С овощами гриль', description_it: 'Con verdure grigliate' },
		],
	},
	{
		category_ru: 'Десерт',
		category_it: 'Dolci',
		items: [
			{ name_ru: 'Свадебный торт', name_it: 'Torta nuziale', description_ru: null, description_it: null },
			{ name_ru: 'Панна котта', name_it: 'Panna cotta', description_ru: 'С ягодным соусом', description_it: 'Con salsa ai frutti di bosco' },
		],
	},
]

export function MenuSection() {
	const t = useTranslations('menu')
	const locale = useLocale() as Locale

	return (
		<section id="menu" className="px-8 sm:px-12 py-16">
			<Reveal>
				<SectionHeading title={t('title')} />
			</Reveal>

			<div className="max-w-md mx-auto space-y-10">
				{menuData.map((category, catIndex) => (
					<Stagger key={catIndex}>
						<motion.div variants={fadeUp}>
							<h3 className="font-serif text-lg text-center text-ink mb-6 tracking-wide">
								{locale === 'ru' ? category.category_ru : category.category_it}
							</h3>
						</motion.div>

						<div className="space-y-4">
							{category.items.map((item, itemIndex) => (
								<motion.div
									key={itemIndex}
									variants={fadeUp}
									className="flex justify-between items-baseline gap-4"
								>
									<div className="flex-1">
										<p className="text-sm font-sans text-ink">
											{locale === 'ru' ? item.name_ru : item.name_it}
										</p>
										{(locale === 'ru' ? item.description_ru : item.description_it) && (
											<p className="text-xs text-ink-muted font-sans mt-0.5">
												{locale === 'ru' ? item.description_ru : item.description_it}
											</p>
										)}
									</div>
									<span className="flex-shrink-0 h-px flex-1 max-w-[60px] bg-border-light self-center" />
								</motion.div>
							))}
						</div>
					</Stagger>
				))}
			</div>
		</section>
	)
}
