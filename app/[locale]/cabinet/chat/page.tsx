import { InvitationCard } from '@/components/layout/invitation-card';
import { ChatView } from '@/components/chat/chat-view';
import { getCurrentGuest } from '@/lib/actions/auth';
import { getMessages } from '@/lib/actions/chat';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function GuestChatPage({
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

  const { data: messages } = await getMessages(guest.id);

  return (
    <InvitationCard>
      <ChatView
        guest={guest}
        initialMessages={messages ?? []}
        senderRole="guest"
      />
    </InvitationCard>
  );
}
