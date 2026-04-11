'use client'

import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import { Link } from '@/lib/i18n/navigation'
import type { Guest } from '@/types'
import { useTranslations } from 'next-intl'

interface ChatListProps {
	guests: Guest[]
}

export function ChatList({ guests }: ChatListProps) {
	const t = useTranslations('admin')

	return (
		<div className="space-y-6">
			<SectionHeading title={t('chat')} className="text-left mb-6" />

			<div className="space-y-2">
				{guests.map((guest) => (
					<Link
						key={guest.id}
						href={`/chat/${guest.id}`}
						className="block bg-cream rounded-sm border border-border-light p-4 hover:border-ink-muted/30 transition-colors"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-parchment border border-border-light flex items-center justify-center text-xs font-sans text-ink-muted">
									{guest.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p className="text-sm font-sans text-ink">{guest.name}</p>
									<p className="text-xs text-ink-muted font-sans">{guest.email}</p>
								</div>
							</div>
							<Badge status={guest.rsvp_status} />
						</div>
					</Link>
				))}

				{guests.length === 0 && (
					<div className="bg-cream rounded-sm border border-border-light p-12 text-center">
						<p className="text-sm text-ink-muted font-sans">No guests yet</p>
					</div>
				)}
			</div>
		</div>
	)
}
