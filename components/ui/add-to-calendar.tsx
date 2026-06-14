'use client'

import { formatGoogleCalendarDate } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AddToCalendarProps {
	title: string
	description?: string
	location?: string
	startDate: string
	endDate: string
	className?: string
}

function isAndroidUA(ua: string) {
	return /android/.test(ua)
}

function buildIcsHref(p: Omit<AddToCalendarProps, 'className'>) {
	const params = new URLSearchParams({
		title: p.title,
		description: p.description ?? '',
		location: p.location ?? '',
		start: p.startDate,
		end: p.endDate,
	})
	return `/api/calendar?${params.toString()}`
}

function buildGoogleHref(p: Omit<AddToCalendarProps, 'className'>) {
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: p.title,
		details: p.description ?? '',
		location: p.location ?? '',
		dates: `${formatGoogleCalendarDate(p.startDate)}/${formatGoogleCalendarDate(p.endDate)}`,
	})
	return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function AddToCalendar({
	title,
	description,
	location,
	startDate,
	endDate,
	className,
}: AddToCalendarProps) {
	const t = useTranslations('cover')
	const event = { title, description, location, startDate, endDate }

	const handleClick = () => {
		const ua = navigator.userAgent.toLowerCase()

		if (isAndroidUA(ua)) {
			window.open(buildGoogleHref(event), '_blank', 'noopener,noreferrer')
			return
		}

		// Apple devices and everything else: download .ics
		// Use location.assign so user can come back via browser back-button
		window.location.href = buildIcsHref(event)
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				'inline-flex items-center justify-center rounded-full',
				'bg-ink text-cream opacity-70',
				'size-9 sm:size-auto sm:gap-2 sm:px-4 sm:py-2',
				'text-[11px] sm:text-xs',
				'font-sans tracking-[0.04em]',
				'hover:bg-ink-light transition-colors',
				'shadow-(--shadow-subtle)',
				'touch-manipulation',
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
			<span className="hidden sm:inline whitespace-nowrap">{t('addToCalendar')}</span>
		</button>
	)
}
