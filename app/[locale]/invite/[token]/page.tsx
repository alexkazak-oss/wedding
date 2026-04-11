import { InvitationCard } from '@/components/layout/invitation-card';
import { InviteHandler } from '@/components/auth/invite-handler';
import { setRequestLocale } from 'next-intl/server';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return (
    <InvitationCard>
      <div className="px-8 sm:px-12 py-20 min-h-[60vh] flex items-center justify-center">
        <InviteHandler token={token} />
      </div>
    </InvitationCard>
  );
}
