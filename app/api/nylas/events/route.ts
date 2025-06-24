import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import nylas from '@/lib/nylas';

// POST /api/nylas/events - Create a Nylas calendar event
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, title, description, startTime, endTime, reminders } = body;

    console.log('Received request data:', { submissionId, title, startTime, endTime, reminders });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.nylasGrantId) {
      return NextResponse.json({ error: 'Nylas not connected for this user' }, { status: 400 });
    }

    // Get the user's primary calendar using the grant ID
    const calendars = await nylas.calendars.list({
      identifier: user.nylasGrantId,
    });
    const primaryCalendar = calendars.data.find(c => c.isPrimary);
    if (!primaryCalendar) {
      return NextResponse.json({ error: 'Primary calendar not found' }, { status: 404 });
    }

    // Convert ISO strings to Unix timestamps (seconds since epoch)
    const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    console.log('Converted timestamps:', { startTimestamp, endTimestamp, startTime, endTime });

    // Convert reminders array to the format Nylas expects
    const formattedReminders = reminders ? {
      useDefault: false,
      overrides: reminders.map((reminder: any) => ({
        reminderMinutes: reminder.minutes,
        reminderMethod: reminder.type
      }))
    } : undefined;

    console.log('Formatted reminders:', formattedReminders);

    // Create the event using the grant ID
    const eventData = {
      identifier: user.nylasGrantId,
      requestBody: {
        title,
        description,
        when: {
          startTime: startTimestamp,
          endTime: endTimestamp,
        },
        reminders: formattedReminders,
        sendNotifications: true, // Send email confirmation to the user
      },
      queryParams: {
        calendarId: primaryCalendar.id,
      },
    };

    console.log('Sending event data to Nylas:', JSON.stringify(eventData, null, 2));

    const event = await nylas.events.create(eventData);

    // Save the Nylas event ID to the submission (only if submissionId is not 'temp-id')
    if (submissionId && submissionId !== 'temp-id' && event.data.id) {
      try {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { calendarEventId: event.data.id },
        });
        console.log(`Updated submission ${submissionId} with calendar event ID ${event.data.id}`);
      } catch (updateError) {
        console.error('Failed to update submission with calendar event ID:', updateError);
        // Don't fail the entire request if the update fails
      }
    }

    return NextResponse.json(event.data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Nylas event:', error?.message || error);
    
    // Provide more specific error messages if possible
    if (error?.response?.data) {
      return NextResponse.json({ error: error.response.data }, { status: error.response.status });
    }
    
    // Handle specific Nylas API errors
    if (error?.message?.includes('Invalid when.start_time')) {
      return NextResponse.json({ error: 'Invalid date format for calendar event' }, { status: 400 });
    }
    
    if (error?.message?.includes('Invalid reminders')) {
      return NextResponse.json({ error: 'Invalid reminder format for calendar event' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
} 