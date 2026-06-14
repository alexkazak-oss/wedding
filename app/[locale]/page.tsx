import { NameGate } from '@/components/invite/name-gate'
import { getCurrentInvite } from '@/lib/actions/invite'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

// Главная зависит от сессии и живых данных — без кэша.
export const dynamic = 'force-dynamic'

type Locale = 'ru' | 'it'

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	setRequestLocale(locale)

	const invite = await getCurrentInvite()
	if (invite?.tokenRaw) {
		redirect(`/${invite.locale}/${invite.tokenRaw}`)
	}

	return <NameGate locale={(locale as Locale) === 'it' ? 'it' : 'ru'} />
}
