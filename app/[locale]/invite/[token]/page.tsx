import {
	CoverSection,
	DetailsSection,
	FooterSection,
	GreetingSection,
	LocationSection,
	TimingSection,
} from '@/components/invitation'
import { InvitationCard } from '@/components/layout/invitation-card'
import { VerifyForm } from '@/components/invite/verify-form'
import { Divider } from '@/components/ui/divider'
import { openInviteByToken } from '@/lib/actions/invite'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

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

	if (result.state === 'verify') {
		return (
			<InvitationCard>
				<section className="px-6 sm:px-12 pt-20 pb-16 min-h-[80vh] flex flex-col items-center justify-center text-center">
					<h2 className="font-serif text-2xl sm:text-3xl text-ink mb-4 tracking-wide">
						Подтвердите личность
					</h2>
					<p className="text-sm text-ink-light font-sans max-w-sm mb-10 leading-[1.7]">
						Это приглашение уже открывали на другом устройстве. Введите имя
						{result.needsLastName ? ' и фамилию' : ''}, чтобы продолжить.
					</p>
					<VerifyForm inviteId={result.inviteId} needsLastName={result.needsLastName} />
				</section>
			</InvitationCard>
		)
	}

	const { invite } = result
	const greeting = invite.frozenSnapshot?.greeting ?? invite.greeting

	return (
		<InvitationCard>
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
			<FooterSection />
		</InvitationCard>
	)
}
