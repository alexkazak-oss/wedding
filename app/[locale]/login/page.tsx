import { LoginForm } from '@/components/auth/login-form';
import { InvitationCard } from '@/components/layout/invitation-card';
import { setRequestLocale } from 'next-intl/server';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <InvitationCard>
      <div className="px-8 sm:px-12 py-20 min-h-[60vh] flex items-center justify-center">
        <LoginForm />
      </div>
    </InvitationCard>
  );
}
