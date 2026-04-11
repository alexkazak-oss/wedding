'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Guest } from '@/types'
import { useTranslations } from 'next-intl'

interface GuestListProps {
	guests: Guest[]
}

export function GuestList({ guests }: GuestListProps) {
	const t = useTranslations('admin')

	const counts = {
		total: guests.length,
		accepted: guests.filter((g) => g.rsvp_status === 'accepted').length,
		declined: guests.filter((g) => g.rsvp_status === 'declined').length,
		pending: guests.filter((g) => g.rsvp_status === 'pending').length,
		totalGuests: guests
			.filter((g) => g.rsvp_status === 'accepted')
			.reduce((sum, g) => sum + g.guest_count, 0),
	}

	return (
		<div className="space-y-8">
			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<StatCard label={t('totalGuests')} value={counts.total} />
				<StatCard label={t('accepted')} value={counts.accepted} accent="sage" />
				<StatCard label={t('declined')} value={counts.declined} accent="rose" />
				<StatCard label={t('pending')} value={counts.pending} />
			</div>

			{/* Guest table */}
			<div className="bg-cream rounded-sm border border-border-light overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border-light">
								<th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
									{t('guestName')}
								</th>
								<th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal hidden sm:table-cell">
									{t('email')}
								</th>
								<th className="text-center px-4 py-3 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
									{t('status')}
								</th>
								<th className="text-center px-4 py-3 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
									{t('guests')}
								</th>
							</tr>
						</thead>
						<tbody>
							{guests.map((guest) => (
								<tr
									key={guest.id}
									className="border-b border-border-light last:border-0 hover:bg-parchment/50 transition-colors"
								>
									<td className="px-4 py-3">
										<p className="text-sm font-sans text-ink">{guest.name}</p>
										<p className="text-xs text-ink-muted font-sans sm:hidden">{guest.email}</p>
									</td>
									<td className="px-4 py-3 text-sm text-ink-muted font-sans hidden sm:table-cell">
										{guest.email}
									</td>
									<td className="px-4 py-3 text-center">
										<Badge status={guest.rsvp_status} />
									</td>
									<td className="px-4 py-3 text-center text-sm font-sans text-ink">
										{guest.rsvp_status === 'accepted' ? guest.guest_count : '—'}
									</td>
								</tr>
							))}

							{guests.length === 0 && (
								<tr>
									<td colSpan={4} className="px-4 py-12 text-center text-sm text-ink-muted font-sans">
										No guests yet
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Total confirmed guests */}
			{counts.accepted > 0 && (
				<div className="text-center">
					<p className="text-xs uppercase tracking-widest text-ink-muted font-sans">
						{t('accepted')}: {counts.totalGuests} {t('guests').toLowerCase()}
					</p>
				</div>
			)}
		</div>
	)
}

function StatCard({
	label,
	value,
	accent,
}: {
	label: string
	value: number
	accent?: 'sage' | 'rose'
}) {
	return (
		<div className="bg-cream rounded-sm border border-border-light p-4 text-center">
			<p
				className={cn(
					'font-serif text-3xl',
					accent === 'sage' && 'text-sage',
					accent === 'rose' && 'text-rose',
					!accent && 'text-ink',
				)}
			>
				{value}
			</p>
			<p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mt-1">
				{label}
			</p>
		</div>
	)
}
