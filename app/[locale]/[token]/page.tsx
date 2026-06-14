import {
	CoverSection,
	DetailsSection,
	FooterSection,
	GreetingSection,
	LocationSection,
	TimingSection,
} from '@/components/invitation'
import { ClaimSession } from '@/components/invite/claim-session'
import { RsvpForm } from '@/components/invite/rsvp-form'
import { InvitationCard } from '@/components/layout/invitation-card'
import { Divider } from '@/components/ui/divider'
import { openInviteByToken } from '@/lib/actions/invite'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

// Всегда рендерим заново, чтобы правки/удаление в админке сразу были видны гостю.
export const dynamic = 'force-dynamic'

export default async function InvitePage({
	params,
}: {
	params: Promise<{ locale: string; token: string }>
}) {
	const { locale, token } = await params
	setRequestLocale(locale)

	const result = await openInviteByToken(token)

	if (result.state === 'not_found') {
		notFound()
	}

	const { invite } = result
	// Живое значение из админки (без заморозки) — чтобы правки сразу отражались.
	const greeting = invite.greeting

	return (
		<InvitationCard>
			<ClaimSession token={token} />
			<CoverSection />
			<Divider ornament />
			<GreetingSection overrideTitle={greeting} />
			<Divider ornament />
			<LocationSection />
			<Divider ornament />
			<TimingSection />
			<Divider ornament />
			<DetailsSection />
			<Divider ornament />
			<RsvpForm
				token={token}
				locale={locale === 'it' ? 'it' : 'ru'}
				initial={{
					attending: invite.attending ?? null,
					transport: invite.transport ?? null,
					allergies: invite.allergies ?? null,
					alcohol: invite.alcohol ?? [],
				}}
			/>
			<Divider ornament />
			<FooterSection />
		</InvitationCard>
	)
}
