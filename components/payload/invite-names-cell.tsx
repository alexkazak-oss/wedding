'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

// Узкий, сериализуемый набор пропсов (Payload передаёт больше, в т.ч.
// несериализуемый onClick — его в контракт клиентского компонента не тянем).
type InviteNamesCellProps = {
	cellData?: unknown
	rowData?: Record<string, unknown>
	link?: boolean
	linkURL?: string
}

// Ячейка заглавной колонки списка приглашений. Сверху — «Имена для списка»
// (displayNames), под ними — личности этого приглашения. Личность = отдельный
// человек, и именно по личностям ведётся подсчёт гостей (см. invites-report).
// Приглашение лишь группирует личности под одной ссылкой.

type Guest = { firstName?: string | null; lastName?: string | null }

function guestLabel(g: Guest): string {
	return [g.firstName, g.lastName].filter(Boolean).join(' ').trim()
}

// Личности приглашения: основной список guests, с запасным путём на старые
// записи (firstName/partner), ещё не перенесённые в массив guests.
function personNames(row: Record<string, unknown> | undefined): string[] {
	const guests = Array.isArray(row?.guests) ? (row.guests as Guest[]) : []
	const fromList = guests.map(guestLabel).filter(Boolean)
	if (fromList.length > 0) return fromList

	const legacy: string[] = []
	const main = guestLabel({ firstName: row?.firstName as string, lastName: row?.lastName as string })
	if (main) legacy.push(main)
	const partner = guestLabel({
		firstName: row?.partnerFirstName as string,
		lastName: row?.partnerLastName as string,
	})
	if (partner) legacy.push(partner)
	return legacy
}

// 1 гость · 2 гостя · 5 гостей
function pluralGuests(n: number): string {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'гость'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'гостя'
	return 'гостей'
}

export function InviteNamesCell(props: InviteNamesCellProps) {
	const { cellData, rowData, link, linkURL } = props
	const { config } = useConfig()

	const title = (typeof cellData === 'string' && cellData.trim()) || '—'
	const names = personNames(rowData)

	const content = (
		<span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3, lineHeight: 1.3 }}>
			<span style={{ fontWeight: 600, color: 'var(--theme-text)' }}>{title}</span>
			{names.length > 0 ? (
				<span style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>
					{names.length} {pluralGuests(names.length)}: {names.join(', ')}
				</span>
			) : null}
		</span>
	)

	// Заглавная колонка кликабельна — ведёт в редактирование. Кастомный Cell
	// заменяет DefaultCell целиком, поэтому ссылку строим сами (linkURL приходит
	// только при кастомном formatDocURL, иначе собираем дефолтный admin-URL).
	if (link && rowData?.id != null) {
		const href =
			linkURL ||
			formatAdminURL({
				adminRoute: config.routes.admin,
				path: `/collections/invites/${encodeURIComponent(String(rowData.id))}`,
			})
		return (
			<Link href={href} prefetch={false}>
				{content}
			</Link>
		)
	}

	return content
}
