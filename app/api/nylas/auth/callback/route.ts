import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import nylas from '@/lib/nylas';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const clerkId = request.nextUrl.searchParams.get('state'); // Get clerkId from state
  const error = request.nextUrl.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_error=true&error=${encodeURIComponent(
        error
      )}`
    );
  }

  // Ensure user is logged in
  if (!clerkId) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_error=true&error=${encodeURIComponent(
        'Clerk user ID not found in state'
      )}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_error=true&error=${encodeURIComponent(
        'No authorization code provided'
      )}`
    );
  }

  if (
    !process.env.NYLAS_CLIENT_ID ||
    !process.env.NYLAS_API_KEY ||
    !process.env.APP_URL
  ) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_error=true&error=${encodeURIComponent(
        'Missing Nylas configuration'
      )}`
    );
  }

  try {
    const { grantId, email } = await nylas.auth.exchangeCodeForToken({
      clientId: process.env.NYLAS_CLIENT_ID,
      clientSecret: process.env.NYLAS_API_KEY,
      redirectUri: `${process.env.APP_URL}/api/nylas/auth/callback`,
      code: code,
    });

    console.log('Nylas grant successful:', { clerkId, email, grantId });

    await prisma.user.upsert({
      where: { clerkId },
      update: { nylasGrantId: grantId, email },
      create: {
        clerkId,
        email,
        nylasGrantId: grantId,
      },
    });

    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_connected=true`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.redirect(
      `${process.env.APP_URL}/settings?calendar_error=true&error=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
} 