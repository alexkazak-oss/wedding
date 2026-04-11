import { GuestList } from '@/components/admin/guest-list';
import { getCurrentGuest } from '@/lib/actions/auth';
import { getGuests } from '@/lib/actions/guests';
import { setRequestLocale } from 'next-intl/server';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await getCurrentGuest();
  if (!admin) return null;

  const { data: guests } = await getGuests(admin.event_id);

  return <GuestList guests={guests ?? []} />;
}
