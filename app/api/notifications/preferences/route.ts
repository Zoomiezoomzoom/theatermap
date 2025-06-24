import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/notifications';
import prisma from '@/lib/prisma';

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = await getNotificationPreferences(user.id);
    return NextResponse.json(preferences);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching notification preferences:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      deadlineReminders,
      deadlineReminderDays,
      overdueNotifications,
      statusUpdates,
      weeklyDigest,
      emailEnabled
    } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedPreferences = await updateNotificationPreferences(user.id, {
      deadlineReminders,
      deadlineReminderDays,
      overdueNotifications,
      statusUpdates,
      weeklyDigest,
      emailEnabled
    });

    return NextResponse.json(updatedPreferences);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating notification preferences:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 