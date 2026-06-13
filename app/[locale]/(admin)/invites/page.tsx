import { InviteCreateForm } from '@/components/admin/invite-create-form'
import { InvitesTable } from '@/components/admin/invites-table'
import { listInvites } from '@/lib/actions/invite'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

async function getSiteOrigin() {
	const h = await headers()
	const envUrl = process.env.NEXT_PUBLIC_SITE_URL
	if (envUrl) return envUrl
	const host = h.get('host') ?? 'localhost:3000'
	const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
	return `${proto}://${host}`
}

export default async function AdminInvitesPage({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	setRequestLocale(locale)

	const supabase = await createClient()
	const { data: event } = await supabase.from('events').select('id').eq('slug', 'wedding').single()
	const eventId = event?.id ?? null

	const origin = await getSiteOrigin()

	let invites: Awaited<ReturnType<typeof listInvites>>['invites'] = null
	let listError: string | null = null
	if (eventId) {
		const result = await listInvites(eventId)
		invites = result.invites
		listError = result.error ?? null
	}

	return (
		<div className="space-y-10">
			<header>
				<h1 className="font-serif text-2xl text-ink">Персональные приглашения</h1>
				<p className="text-xs text-ink-muted font-sans mt-1">
					Создавайте уникальные ссылки для каждого гостя или пары. На первом открытии данные замораживаются.
				</p>
			</header>

			{eventId ? (
				<section>
					<h2 className="text-[11px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-4">
						Новое приглашение
					</h2>
					<InviteCreateForm eventId={eventId} siteOrigin={origin} />
				</section>
			) : (
				<p className="text-sm text-red-700/80 font-sans">
					Не найдено мероприятие со slug=&quot;wedding&quot;. Запустите миграции и сид.
				</p>
			)}

			<section>
				<h2 className="text-[11px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-4">
					Все приглашения
				</h2>
				{listError ? (
					<p className="text-sm text-red-700/80 font-sans">{listError}</p>
				) : (
					<InvitesTable invites={invites ?? []} siteOrigin={origin} />
				)}
			</section>
		</div>
	)
}
