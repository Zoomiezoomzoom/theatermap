import { NextRequest, NextResponse } from 'next/server';
import { checkDeadlinesAndSendReminders } from '@/lib/notifications';

// POST /api/notifications/trigger - Trigger deadline checks (called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for the cron job
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Triggering deadline check...');
    
    // Check for upcoming deadlines and send reminders
    await checkDeadlinesAndSendReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Deadline check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error triggering deadline check:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Failed to trigger deadline check',
      details: errorMessage
    }, { status: 500 });
  }
}

// GET /api/notifications/trigger - Manual trigger for testing
export async function GET(request: NextRequest) {
  try {
    console.log('Manual deadline check triggered...');
    
    // Check for upcoming deadlines and send reminders
    await checkDeadlinesAndSendReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Manual deadline check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in manual deadline check:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Failed to complete deadline check',
      details: errorMessage
    }, { status: 500 });
  }
} 