import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { testEmail, validateEmailData } from '@/lib/email';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    // Get user to verify they own this email
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user || user.email !== email) {
      return NextResponse.json({ error: 'Email address not associated with your account' }, { status: 400 });
    }

    // Validate email configuration
    const emailData = {
      from: `Ascend <notifications@${process.env.EMAIL_FROM_DOMAIN || 'ascend.com'}>`,
      to: email,
      subject: 'Test Email from Ascend',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
    };

    const validationErrors = validateEmailData(emailData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Email configuration errors', 
        details: validationErrors 
      }, { status: 400 });
    }

    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'Email service not configured', 
        details: 'RESEND_API_KEY environment variable is missing' 
      }, { status: 500 });
    }

    // Send test email
    const result = await testEmail(email);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result 
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Test email failed:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: errorMessage,
      troubleshooting: {
        checkApiKey: !!process.env.RESEND_API_KEY,
        checkDomain: !!process.env.EMAIL_FROM_DOMAIN,
        checkAppUrl: !!process.env.APP_URL
      }
    }, { status: 500 });
  }
} 