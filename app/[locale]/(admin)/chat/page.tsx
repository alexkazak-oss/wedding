import { ChatList } from '@/components/admin/chat-list';
import { getCurrentGuest } from '@/lib/actions/auth';
import { getGuests } from '@/lib/actions/guests';
import { setRequestLocale } from 'next-intl/server';

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await getCurrentGuest();
  if (!admin) return null;

  const { data: guests } = await getGuests(admin.event_id);
  const guestsOnly = (guests ?? []).filter((g) => g.role === 'guest');

  return <ChatList guests={guestsOnly} />;
}
