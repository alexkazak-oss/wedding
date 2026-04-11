import { InvitationCard } from '@/components/layout/invitation-card';
import { CabinetContent } from '@/components/guest/cabinet-content';
import { getCurrentGuest } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function CabinetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const guest = await getCurrentGuest();

  if (!guest) {
    redirect(`/${locale}/login`);
  }

  return (
    <InvitationCard>
      <CabinetContent guest={guest} />
    </InvitationCard>
  );
}
