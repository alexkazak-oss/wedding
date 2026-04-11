'use client'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { RsvpFormData } from '@/types'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function RsvpSection() {
	const t = useTranslations('rsvp')
	const [status, setStatus] = useState<'accepted' | 'declined' | null>(null)
	const [guestCount, setGuestCount] = useState(1)
	const [comment, setComment] = useState('')
	const [submitted, setSubmitted] = useState(false)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!status) return

		setLoading(true)

		const data: RsvpFormData = {
			status,
			guestCount: status === 'accepted' ? guestCount : 0,
			comment,
		}

		// TODO: submit to server action
		console.log('RSVP submitted:', data)
		await new Promise((resolve) => setTimeout(resolve, 800))

		setSubmitted(true)
		setLoading(false)
	}

	if (submitted) {
		return (
			<section id="rsvp" className="px-8 sm:px-12 py-16">
				<Reveal>
					<div className="text-center space-y-4">
						<div className="text-4xl">✉</div>
						<h2 className="font-serif text-2xl text-ink">{t('thankYou')}</h2>
					</div>
				</Reveal>
			</section>
		)
	}

	return (
		<section id="rsvp" className="px-8 sm:px-12 py-16">
			<Reveal>
				<SectionHeading title={t('title')} subtitle={t('subtitle')} />
			</Reveal>

			<Reveal delay={0.15}>
				<form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-8">
					{/* Accept / Decline toggle */}
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => setStatus('accepted')}
							className={cn(
								'flex-1 py-3 text-sm font-sans uppercase tracking-wider border transition-all duration-300',
								status === 'accepted'
									? 'bg-ink text-cream border-ink'
									: 'bg-transparent text-ink-muted border-border hover:border-ink-muted',
							)}
						>
							{t('accept')}
						</button>
						<button
							type="button"
							onClick={() => setStatus('declined')}
							className={cn(
								'flex-1 py-3 text-sm font-sans uppercase tracking-wider border transition-all duration-300',
								status === 'declined'
									? 'bg-ink text-cream border-ink'
									: 'bg-transparent text-ink-muted border-border hover:border-ink-muted',
							)}
						>
							{t('decline')}
						</button>
					</div>

					{/* Guest count (only if accepted) */}
					{status === 'accepted' && (
						<div className="space-y-2">
							<label className="text-xs uppercase tracking-widest text-ink-muted font-sans">
								{t('guestCount')}
							</label>
							<div className="flex items-center gap-4">
								<button
									type="button"
									onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
									className="w-10 h-10 border border-border text-ink-light hover:border-ink-muted transition-colors flex items-center justify-center font-sans"
								>
									−
								</button>
								<span className="font-serif text-2xl text-ink w-8 text-center">{guestCount}</span>
								<button
									type="button"
									onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
									className="w-10 h-10 border border-border text-ink-light hover:border-ink-muted transition-colors flex items-center justify-center font-sans"
								>
									+
								</button>
							</div>
						</div>
					)}

					{/* Comment */}
					<Textarea
						id="comment"
						label={t('comment')}
						placeholder={t('commentPlaceholder')}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>

					{/* Submit */}
					<Button
						type="submit"
						disabled={!status}
						loading={loading}
						className="w-full"
						size="lg"
					>
						{t('submit')}
					</Button>
				</form>
			</Reveal>
		</section>
	)
}
