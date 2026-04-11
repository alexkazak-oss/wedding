import { ChatView } from '@/components/chat/chat-view';
import { getCurrentGuest } from '@/lib/actions/auth';
import { getMessages } from '@/lib/actions/chat';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function AdminChatDetailPage({
  params,
}: {
  params: Promise<{ locale: string; guestId: string }>;
}) {
  const { locale, guestId } = await params;
  setRequestLocale(locale);

  const admin = await getCurrentGuest();
  if (!admin) return null;

  // Fetch the guest record
  const supabase = await createClient();
  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('id', guestId)
    .single();

  if (!guest) {
    notFound();
  }

  const { data: messages } = await getMessages(guestId);

  return (
    <div className="bg-cream rounded-sm border border-border-light overflow-hidden" style={{ height: '75vh' }}>
      <ChatView
        guest={guest}
        initialMessages={messages ?? []}
        senderRole="admin"
        backHref="/chat"
        headerTitle={guest.name}
      />
    </div>
  );
}
