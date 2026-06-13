'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface InviteRow {
	id: string
	display_names: string | null
	name: string
	greeting: string | null
	first_name: string | null
	last_name: string | null
	locale: string
	max_guests: number
	invite_token: string
	opened_at: string | null
	last_seen_at: string | null
	rsvp_status: string
	guest_count: number
	created_at: string
}

interface InvitesTableProps {
	invites: InviteRow[]
	siteOrigin: string
}

export function InvitesTable({ invites, siteOrigin }: InvitesTableProps) {
	const [copied, setCopied] = useState<string | null>(null)

	async function copy(url: string, id: string) {
		await navigator.clipboard.writeText(url)
		setCopied(id)
		setTimeout(() => setCopied(null), 1200)
	}

	if (invites.length === 0) {
		return <p className="text-sm text-ink-muted font-sans">Приглашений пока нет.</p>
	}

	return (
		<div className="overflow-x-auto -mx-2 sm:mx-0">
			<table className="w-full min-w-[720px] text-sm">
				<thead className="text-[10px] uppercase tracking-[0.18em] text-ink-muted font-sans border-b border-border">
					<tr>
						<th className="text-left py-3 px-2">Гость</th>
						<th className="text-left py-3 px-2">Статус</th>
						<th className="text-left py-3 px-2">Открыто</th>
						<th className="text-left py-3 px-2">RSVP</th>
						<th className="text-left py-3 px-2">Ссылка</th>
					</tr>
				</thead>
				<tbody className="font-sans">
					{invites.map((i) => {
						const url = `${siteOrigin}/${i.locale}/invite/${i.invite_token}`
						return (
							<tr key={i.id} className="border-b border-border-light">
								<td className="py-3 px-2">
									<div className="text-ink">{i.display_names ?? i.name}</div>
									<div className="text-[11px] text-ink-muted">
										{i.first_name} {i.last_name ?? ''} · {i.locale.toUpperCase()} · до {i.max_guests}
									</div>
								</td>
								<td className="py-3 px-2">
									<span
										className={cn(
											'inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm',
											i.opened_at ? 'bg-ink/10 text-ink' : 'bg-parchment text-ink-muted',
										)}
									>
										{i.opened_at ? 'Открыто' : 'Не открыто'}
									</span>
								</td>
								<td className="py-3 px-2 text-ink-light text-xs">
									{i.opened_at ? new Date(i.opened_at).toLocaleString('ru-RU') : '—'}
								</td>
								<td className="py-3 px-2 text-ink-light text-xs">
									{i.rsvp_status} {i.guest_count > 0 && `· ${i.guest_count}`}
								</td>
								<td className="py-3 px-2">
									<button
										type="button"
										onClick={() => copy(url, i.id)}
										className="text-xs text-ink underline decoration-dotted hover:no-underline"
									>
										{copied === i.id ? 'Скопировано' : 'Скопировать'}
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
