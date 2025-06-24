import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({ 
      connected: !!user.nylasGrantId 
    });
  } catch (error) {
    console.error('Error checking Nylas status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 