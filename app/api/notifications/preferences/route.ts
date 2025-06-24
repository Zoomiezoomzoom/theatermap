import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get user notification preferences
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { notificationPreferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return default preferences if none exist
    if (!user.notificationPreferences) {
      const defaultPreferences = {
        deadlineReminders: true,
        deadlineReminderDays: [7, 3, 1],
        overdueNotifications: true,
        statusUpdates: true,
        weeklyDigest: true,
        emailEnabled: true
      };

      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(user.notificationPreferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
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

    // Update or create notification preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {
        deadlineReminders,
        deadlineReminderDays,
        overdueNotifications,
        statusUpdates,
        weeklyDigest,
        emailEnabled,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        deadlineReminders,
        deadlineReminderDays,
        overdueNotifications,
        statusUpdates,
        weeklyDigest,
        emailEnabled
      }
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 