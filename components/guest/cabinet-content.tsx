'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { signOut } from '@/lib/actions/auth'
import { Link } from '@/lib/i18n/navigation'
import type { Guest, RsvpStatus } from '@/types'
import { useLocale, useTranslations } from 'next-intl'

interface CabinetContentProps {
	guest: Guest
}

const statusLabels: Record<string, Record<RsvpStatus, string>> = {
	ru: { pending: 'Ожидает ответа', accepted: 'Подтверждено', declined: 'Отказ' },
	it: { pending: 'In attesa', accepted: 'Confermato', declined: 'Rifiutato' },
}

export function CabinetContent({ guest }: CabinetContentProps) {
	const t = useTranslations('cabinet')
	const locale = useLocale()

	return (
		<div className="relative">
			{/* Header */}
			<div className="absolute top-6 right-6 flex items-center gap-4">
				<LocaleSwitcher />
			</div>

			<div className="px-8 sm:px-12 pt-16 pb-8">
				<Reveal>
					<div className="text-center mb-2">
						<p className="text-xs uppercase tracking-[0.3em] text-ink-muted font-sans mb-4">
							{t('title')}
						</p>
						<h1 className="font-serif text-3xl sm:text-4xl text-ink">
							{t('welcome')}, {guest.name}
						</h1>
					</div>
				</Reveal>
			</div>

			<Divider ornament />

			{/* RSVP Status */}
			<div className="px-8 sm:px-12 py-8">
				<Reveal>
					<SectionHeading title={t('yourRsvp')} />
					<div className="max-w-sm mx-auto space-y-4">
						<div className="flex items-center justify-between py-3 border-b border-border-light">
							<span className="text-sm text-ink-muted font-sans">{t('yourRsvp')}</span>
							<div className="flex items-center gap-2">
								<Badge status={guest.rsvp_status} />
								<span className="text-sm font-sans text-ink">
									{statusLabels[locale]?.[guest.rsvp_status] ??
										statusLabels.ru[guest.rsvp_status]}
								</span>
							</div>
						</div>

						{guest.rsvp_status === 'accepted' && (
							<div className="flex items-center justify-between py-3 border-b border-border-light">
								<span className="text-sm text-ink-muted font-sans">{t('guestCount')}</span>
								<span className="text-sm font-sans text-ink">{guest.guest_count}</span>
							</div>
						)}

						{guest.comment && (
							<div className="py-3 border-b border-border-light">
								<span className="text-sm text-ink-muted font-sans block mb-1">{t('comment')}</span>
								<p className="text-sm text-ink font-sans">{guest.comment}</p>
							</div>
						)}
					</div>
				</Reveal>
			</div>

			<Divider />

			{/* Actions */}
			<div className="px-8 sm:px-12 py-8">
				<Reveal>
					<div className="max-w-sm mx-auto space-y-3">
						<Link href="/cabinet/chat" className="block">
							<Button variant="outline" className="w-full" size="lg">
								{t('chat')}
							</Button>
						</Link>

						<form action={signOut}>
							<Button variant="ghost" className="w-full" size="sm">
								{t('logout')}
							</Button>
						</form>
					</div>
				</Reveal>
			</div>
		</div>
	)
}
