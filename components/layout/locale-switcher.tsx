'use client'

import { Link, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
	const pathname = usePathname()
	const currentLocale = useLocale() as Locale
	const otherLocale: Locale = currentLocale === 'ru' ? 'it' : 'ru'

	return (
		<Link
			href={pathname}
			locale={otherLocale}
			className={cn(
				'text-xs uppercase tracking-[0.2em] text-ink-muted',
				'hover:text-ink transition-colors font-sans',
				'border-b border-transparent hover:border-ink-muted',
				'pb-0.5',
			)}
		>
			{otherLocale === 'ru' ? 'Рус' : 'Ita'}
		</Link>
	)
}
