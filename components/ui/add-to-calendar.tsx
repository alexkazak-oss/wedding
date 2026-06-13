'use client'

import { downloadIcs } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AddToCalendarProps {
	className?: string
}

export function AddToCalendar({ className }: AddToCalendarProps) {
	const t = useTranslations('cover')

	return (
		<button
			type="button"
			onClick={downloadIcs}
			className={cn(
				'inline-flex items-center gap-2 rounded-full',
				'bg-ink text-cream',
				'px-4 py-2 text-[11px] sm:text-xs',
				'font-sans tracking-[0.04em]',
				'hover:bg-ink-light transition-colors',
				'shadow-[var(--shadow-subtle)]',
				className,
			)}
			aria-label={t('addToCalendar')}
		>
			<svg
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="4.5" width="18" height="16.5" rx="2" />
				<path d="M3 9h18" />
				<path d="M8 3v3M16 3v3" />
				<path d="M12 13v4M10 15h4" />
			</svg>
			<span className="whitespace-nowrap">{t('addToCalendar')}</span>
		</button>
	)
}
