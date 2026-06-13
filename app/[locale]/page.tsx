import { InvitationCard } from '@/components/layout/invitation-card';
import { Divider } from '@/components/ui/divider';
import {
  CoverSection,
  GreetingSection,
  LocationSection,
  TimingSection,
  DetailsSection,
  FooterSection,
} from '@/components/invitation';
import { setRequestLocale } from 'next-intl/server';

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <InvitationCard>
      <CoverSection />
      <Divider ornament />
      <GreetingSection />
      <Divider ornament />
      <LocationSection />
      <Divider ornament />
      <TimingSection />
      <Divider ornament />
      <DetailsSection />
      <Divider ornament />
      <FooterSection />
    </InvitationCard>
  );
}
