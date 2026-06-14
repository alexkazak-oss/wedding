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
import { SectionDivider } from '@/components/ui/section-divider'
import { openInviteByToken } from '@/lib/actions/invite'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

// Страница кэшируется (Data Cache + полный кэш маршрута по токену), поэтому
// 500 заходов обслуживаются без обращений к БД. Свежесть данных обеспечивает
// revalidateTag(invite:{tokenHash}) из хуков коллекции Invites — правки и
// удаление в админке мгновенно сбрасывают кэш конкретного приглашения.
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
	// Число гостей: реальный список, иначе плановое значение. Влияет на форму
	// обращения в приветствии (1 → «ты/te», больше → «вы/voi»).
	const guestCount = invite.guests?.length || invite.maxGuests || 1

	const sections = await getTranslations('sections')

	return (
		<InvitationCard>
			<ClaimSession token={token} />
			<CoverSection />
			<SectionDivider label={sections('greeting')} />
			<GreetingSection overrideTitle={greeting} guestCount={guestCount} />
			<SectionDivider label={sections('location')} />
			<LocationSection />
			<SectionDivider label={sections('timing')} />
			<TimingSection />
			<SectionDivider label={sections('details')} />
			<DetailsSection />
			<SectionDivider label={sections('rsvp')} />
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
			<FooterSection />
		</InvitationCard>
	)
}
