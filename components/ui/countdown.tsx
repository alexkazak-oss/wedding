'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface CountdownProps {
	target: Date | string
	className?: string
}

interface Parts {
	days: number
	hours: number
	minutes: number
	seconds: number
	done: boolean
}

function diff(target: Date): Parts {
	const ms = target.getTime() - Date.now()
	if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
	const s = Math.floor(ms / 1000)
	return {
		days: Math.floor(s / 86400),
		hours: Math.floor((s % 86400) / 3600),
		minutes: Math.floor((s % 3600) / 60),
		seconds: s % 60,
		done: false,
	}
}

function pad(n: number) {
	return String(n).padStart(2, '0')
}

export function Countdown({ target, className }: CountdownProps) {
	const t = useTranslations('countdown')
	const date = typeof target === 'string' ? new Date(target) : target
	const [parts, setParts] = useState<Parts>(() => diff(date))

	useEffect(() => {
		const id = setInterval(() => setParts(diff(date)), 1000)
		return () => clearInterval(id)
	}, [date])

	const cells: Array<{ value: number; label: string }> = [
		{ value: parts.days, label: t('days') },
		{ value: parts.hours, label: t('hours') },
		{ value: parts.minutes, label: t('minutes') },
		{ value: parts.seconds, label: t('seconds') },
	]

	return (
		<div
			className={cn(
				'grid grid-cols-4 items-start justify-items-center',
				'gap-x-3 xs:gap-x-5 sm:gap-x-8',
				'max-w-md mx-auto',
				className,
			)}
		>
			{cells.map((c, i) => (
				<div key={i} className="flex flex-col items-center min-w-0">
					<span
						className="font-serif text-ink font-light tabular-nums leading-none"
						style={{ fontSize: 'clamp(1.5rem, 7.5vw, 2.25rem)' }}
					>
						{pad(c.value)}
					</span>
					<span
						className="mt-2 uppercase text-ink-muted font-sans whitespace-nowrap"
						style={{ fontSize: 'clamp(0.55rem, 2.4vw, 0.7rem)', letterSpacing: '0.16em' }}
					>
						{c.label}
					</span>
				</div>
			))}
		</div>
	)
}
