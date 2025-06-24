import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import nylas from '@/lib/nylas';

export async function GET(request: NextRequest) {
  const clerkId = request.nextUrl.searchParams.get('clerkId');

  if (!clerkId) {
    return NextResponse.json(
      { error: 'Clerk user ID is missing.' },
      { status: 400 }
    );
  }

  if (
    !process.env.NYLAS_CLIENT_ID ||
    !process.env.APP_URL
  ) {
    return NextResponse.json(
      { error: 'Missing Nylas configuration in environment variables.' },
      { status: 500 }
    );
  }

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: process.env.NYLAS_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/nylas/auth/callback`,
    scopes: ['calendar.read_only', 'calendar.modify'],
    state: clerkId,
  });

  return NextResponse.redirect(authUrl);
} 