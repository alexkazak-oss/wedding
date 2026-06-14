'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface CountdownProps {
	target: string
	className?: string
	/** Показывать колонку «недель» (5 ячеек вместо 4). */
	showWeeks?: boolean
}

interface Parts {
	weeks: number
	days: number
	hours: number
	minutes: number
	seconds: number
	done: boolean
}

function diff(target: Date, showWeeks: boolean): Parts {
	const ms = target.getTime() - Date.now()
	if (ms <= 0) return { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
	const s = Math.floor(ms / 1000)
	const totalDays = Math.floor(s / 86400)
	return {
		weeks: showWeeks ? Math.floor(totalDays / 7) : 0,
		days: showWeeks ? totalDays % 7 : totalDays,
		hours: Math.floor((s % 86400) / 3600),
		minutes: Math.floor((s % 3600) / 60),
		seconds: s % 60,
		done: false,
	}
}

function pad(n: number) {
	return String(n).padStart(2, '0')
}

export function Countdown({ target, className, showWeeks = false }: CountdownProps) {
	const t = useTranslations('countdown')
	const [parts, setParts] = useState<Parts | null>(null)

	useEffect(() => {
		const targetDate = new Date(target)
		const tick = () => setParts(diff(targetDate, showWeeks))
		tick()
		const id = setInterval(tick, 1000)
		return () => clearInterval(id)
	}, [target, showWeeks])

	const cells: Array<{ value: number | null; label: string }> = [
		...(showWeeks ? [{ value: parts?.weeks ?? null, label: t('weeks') }] : []),
		{ value: parts?.days ?? null, label: t('days') },
		{ value: parts?.hours ?? null, label: t('hours') },
		{ value: parts?.minutes ?? null, label: t('minutes') },
		{ value: parts?.seconds ?? null, label: t('seconds') },
	]

	return (
		<div
			className={cn('flex items-start gap-x-5 xs:gap-x-7 sm:gap-x-9', className)}
		>
			{cells.map((c) => (
				<div key={c.label} className="flex flex-col items-start min-w-0">
					<span
						className="font-serif text-ink font-light tabular-nums leading-none"
						style={{ fontSize: 'clamp(1.5rem, 7vw, 2.25rem)' }}
					>
						{c.value === null ? '——' : pad(c.value)}
					</span>
					<span
						className="mt-2 text-ink-muted font-sans whitespace-nowrap"
						style={{ fontSize: 'clamp(0.55rem, 2.3vw, 0.7rem)', letterSpacing: '0.1em' }}
					>
						{c.label}
					</span>
				</div>
			))}
		</div>
	)
}
