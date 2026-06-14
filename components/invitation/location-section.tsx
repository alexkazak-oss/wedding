'use client'

import { Reveal } from '@/components/ui/reveal'
import { WEDDING } from '@/lib/constants'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

/** Monochrome Google "G" mark — kept ink-toned so it never breaks the page palette. */
function GoogleMark() {
	return (
		<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true" className="fill-current">
			<path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
		</svg>
	)
}

/** Monochrome Yandex "Y" mark — the brand glyph rendered in ink instead of its usual red. */
function YandexMark() {
	return (
		<span className="font-serif text-[26px] leading-none -mt-0.5" aria-hidden="true">
			Y
		</span>
	)
}

const MAPS = [
	{ key: 'google', href: WEDDING.mapUrl, label: 'Google', Mark: GoogleMark },
	{ key: 'yandex', href: WEDDING.mapUrlYandex, label: 'Yandex', Mark: YandexMark },
] as const

// Each bubble rises out of the button, wobbles like surface tension, then settles.
const bubble: Variants = {
	hidden: { opacity: 0, scale: 0, y: -14 },
	visible: (i: number) => ({
		opacity: 1,
		scale: [0, 1.18, 0.92, 1.06, 1],
		y: 0,
		transition: {
			delay: i * 0.09,
			duration: 0.62,
			ease: [0.34, 1.56, 0.64, 1],
			scale: { duration: 0.62, times: [0, 0.45, 0.68, 0.85, 1] },
		},
	}),
	exit: (i: number) => ({
		opacity: 0,
		scale: 0,
		y: -12,
		transition: { delay: i * 0.04, duration: 0.28, ease: 'easeIn' },
	}),
}

export function LocationSection() {
	const t = useTranslations('location')
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		function onPointerDown(e: PointerEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	return (
		<section id="location" className="px-6 sm:px-12 py-14 text-center flex flex-col items-center gap-10">
			<Reveal delay={0.1}>
				<h3 className="font-serif text-3xl sm:text-4xl text-ink tracking-[0.05em]">
					{t('venue')}
				</h3>
			</Reveal>

			<Reveal delay={0.18}>
				<p className="mt-3 text-sm text-ink-light font-sans">{t('address')}</p>
			</Reveal>

			<Reveal delay={0.26}>
				<div ref={ref} className="relative mt-7 inline-flex justify-center">
					<AnimatePresence>
						{open && (
							<div className="pointer-events-none absolute top-full left-1/2 mt-4 flex -translate-x-1/2 justify-center gap-7 sm:gap-9">
								{MAPS.map(({ key, href, label, Mark }, i) => (
									<motion.div
										key={key}
										custom={i}
										variants={bubble}
										initial="hidden"
										animate="visible"
										exit="exit"
										className="pointer-events-auto flex flex-col items-center"
									>
										{/* Gentle, continuous float — the bubble keeps bobbing once it surfaces. */}
										<motion.a
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => setOpen(false)}
											aria-label={label}
											animate={{ y: [0, -4, 0] }}
											transition={{
												duration: 7 + i * 0.4,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
											className="group relative grid h-16 w-16 place-items-center rounded-full border border-ink/15 bg-cream/70 text-ink/75 shadow-[0_8px_22px_-8px_rgba(22,19,15,0.35)] backdrop-blur-sm transition-colors hover:border-ink/40 hover:text-ink"
										>
											{/* Soft top-left shine to read as a real bubble surface. */}
											<span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_12%_28%,rgba(255,255,255,0.85),transparent_55%)]" />
											<Mark />
										</motion.a>
										<span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ink-muted font-sans">
											{label}
										</span>
									</motion.div>
								))}
							</div>
						)}
					</AnimatePresence>

					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/70 px-5 py-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-ink font-sans hover:bg-ink hover:text-cream transition-colors data-[open=true]:bg-ink data-[open=true]:text-cream"
						data-open={open}
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
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						{t('mapButton')}
					</button>
				</div>
			</Reveal>
		</section>
	)
}
