import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { linkGuestToUser } from '@/lib/actions/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');

  // Extract locale from the URL path
  const pathParts = new URL(request.url).pathname.split('/');
  const locale = pathParts[1] || 'ru';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If there's an invite token, link the guest to this user
      if (token) {
        await linkGuestToUser(token);
      }

      return NextResponse.redirect(`${origin}/${locale}/cabinet`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/${locale}/login`);
}
