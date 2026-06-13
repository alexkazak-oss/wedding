'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface MenuToggleProps {
	className?: string
}

const SECTIONS: Array<{ id: string; key: 'greeting' | 'location' | 'timing' | 'details' }> = [
	{ id: 'greeting', key: 'greeting' },
	{ id: 'location', key: 'location' },
	{ id: 'timing', key: 'timing' },
	{ id: 'details', key: 'details' },
]

export function MenuToggle({ className }: MenuToggleProps) {
	const t = useTranslations('nav')
	const [open, setOpen] = useState(false)

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [open])

	useEffect(() => {
		if (!open) return
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [open])

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Меню"
				aria-expanded={open}
				className={cn(
					'inline-flex flex-col items-center justify-center gap-1.25',
					'w-10 h-10 rounded-full',
					'hover:bg-parchment transition-colors',
					'touch-manipulation',
					className,
				)}
			>
				<span className="block h-px w-4 bg-ink" />
				<span className="block h-px w-4 bg-ink" />
				<span className="block h-px w-4 bg-ink" />
			</button>

			{open && (
				<div
					className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-sm flex flex-col items-center justify-center px-6 safe-x"
					onClick={() => setOpen(false)}
					role="dialog"
					aria-modal="true"
				>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setOpen(false)
						}}
						aria-label="Закрыть"
						className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 inline-flex items-center justify-center text-ink rounded-full hover:bg-parchment transition-colors"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
							<path d="M5 5l14 14M19 5L5 19" />
						</svg>
					</button>

					<nav
						className="flex flex-col items-center gap-6 sm:gap-7"
						onClick={(e) => e.stopPropagation()}
					>
						{SECTIONS.map((s) => (
							<a
								key={s.id}
								href={`#${s.id}`}
								onClick={() => setOpen(false)}
								className="font-serif text-2xl sm:text-3xl text-ink hover:text-ink-light tracking-wide"
							>
								{t(s.key)}
							</a>
						))}

						<div className="mt-4 pt-4 border-t border-border-light w-32 flex justify-center">
							<LocaleSwitcher />
						</div>
					</nav>
				</div>
			)}
		</>
	)
}
