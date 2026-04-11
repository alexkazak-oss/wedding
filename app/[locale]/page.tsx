import { InvitationCard } from '@/components/layout/invitation-card';
import { Divider } from '@/components/ui/divider';
import {
  CoverSection,
  StorySection,
  TimelineSection,
  VenueSection,
  DressCodeSection,
  MenuSection,
  RsvpSection,
  InfoSection,
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
      <StorySection />
      <Divider ornament />
      <TimelineSection />
      <Divider ornament />
      <VenueSection />
      <Divider ornament />
      <DressCodeSection />
      <Divider ornament />
      <MenuSection />
      <Divider ornament />
      <RsvpSection />
      <Divider ornament />
      <InfoSection />
      <Divider />
      <FooterSection />
    </InvitationCard>
  );
}
