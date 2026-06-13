'use client'

import { Link, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types'
import { useLocale } from 'next-intl'
import { Fragment } from 'react'

const labels: Record<Locale, string> = {
	ru: 'Ru',
	it: 'It',
}

const ORDER: Locale[] = ['ru', 'it']

interface LocaleSwitcherProps {
	className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
	const pathname = usePathname()
	const current = useLocale() as Locale

	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 font-sans uppercase tracking-[0.18em] text-xs',
				className,
			)}
		>
			{ORDER.map((loc, i) => (
				<Fragment key={loc}>
					{i > 0 && <span className="text-ink-muted/50 select-none">|</span>}
					{loc === current ? (
						<span className="text-ink font-semibold">{labels[loc]}</span>
					) : (
						<Link
							href={pathname}
							locale={loc}
							className="text-ink-muted/70 hover:text-ink transition-colors"
						>
							{labels[loc]}
						</Link>
					)}
				</Fragment>
			))}
		</div>
	)
}
