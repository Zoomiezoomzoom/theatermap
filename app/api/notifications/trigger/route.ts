import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { triggerDeadlineCheck, triggerWeeklyDigest } from '@/lib/cron';

// Manual trigger for notifications (for testing)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body; // 'deadline' or 'weekly'

    if (!type || !['deadline', 'weekly'].includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    let result;
    if (type === 'deadline') {
      result = await triggerDeadlineCheck();
    } else if (type === 'weekly') {
      result = await triggerWeeklyDigest();
    }

    return NextResponse.json({ 
      success: true, 
      type, 
      message: `${type} notification check completed` 
    });
  } catch (error) {
    console.error('Error triggering notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 