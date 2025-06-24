import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendDeadlineReminder } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email from Clerk
    const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());

    if (!user.email_addresses?.[0]?.email_address) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const testSubmission = {
      id: 'test-submission',
      theaterName: 'Test Theater',
      scriptTitle: 'Test Script',
      submissionDate: '2025-01-15',
      deadline: '2025-06-25',
      status: 'Submitted',
      notes: 'This is a test submission for email verification.'
    };

    const testUser = {
      id: userId,
      email: user.email_addresses[0].email_address,
      firstName: user.first_name || 'Test',
      lastName: user.last_name || 'User'
    };

    const result = await sendDeadlineReminder(testSubmission, testUser, 3);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      emailId: result.data?.id
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
} 