import { ContentEditor } from '@/components/admin/content-editor';
import { getCurrentGuest } from '@/lib/actions/auth';
import { getContentBlocks, getTimelineItems, getMenuItems } from '@/lib/actions/content';
import { setRequestLocale } from 'next-intl/server';

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await getCurrentGuest();
  if (!admin) return null;

  const [
    { data: contentBlocks },
    { data: timelineItems },
    { data: menuItems },
  ] = await Promise.all([
    getContentBlocks(admin.event_id),
    getTimelineItems(admin.event_id),
    getMenuItems(admin.event_id),
  ]);

  return (
    <ContentEditor
      contentBlocks={contentBlocks ?? []}
      timelineItems={timelineItems ?? []}
      menuItems={menuItems ?? []}
    />
  );
}
