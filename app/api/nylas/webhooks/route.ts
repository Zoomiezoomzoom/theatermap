import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook verification and event processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-nylas-signature');
    
    // Verify webhook signature (optional but recommended for security)
    if (signature && process.env.NYLAS_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.NYLAS_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(body);
    console.log('Received webhook:', data);

    // Handle different webhook types
    switch (data.type) {
      case 'event.created':
        console.log('Calendar event created:', data.data);
        // You can add logic here to update your database or send notifications
        break;
      
      case 'event.updated':
        console.log('Calendar event updated:', data.data);
        break;
      
      case 'event.deleted':
        console.log('Calendar event deleted:', data.data);
        break;
      
      case 'calendar.created':
        console.log('Calendar created:', data.data);
        break;
      
      case 'calendar.updated':
        console.log('Calendar updated:', data.data);
        break;
      
      case 'calendar.deleted':
        console.log('Calendar deleted:', data.data);
        break;
      
      default:
        console.log('Unknown webhook type:', data.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle webhook verification challenge
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    console.log('Responding to webhook challenge:', challenge);
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  return NextResponse.json({ message: 'Webhook endpoint is active' });
} 