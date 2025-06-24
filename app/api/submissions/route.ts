import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/submissions - Get all submissions for the authenticated user
export async function GET() {
  try {
    let userId;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error('Auth error (GET):', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      let clerkUser;
      try {
        const authResult = await auth();
        clerkUser = authResult.user;
      } catch (authError) {
        console.error('Auth error (GET, user creation):', authError);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
        }
      });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { submissionDate: 'desc' }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    let userId;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error('Auth error (POST):', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error (POST):', jsonError);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      theaterName,
      scriptTitle,
      submissionDate,
      deadline,
      status,
      fee,
      contactPerson,
      contactEmail,
      notes,
      responseDate
    } = body;

    // Validate required fields
    if (!theaterName || !scriptTitle || !submissionDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: theaterName, scriptTitle, submissionDate' 
      }, { status: 400 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      let clerkUser;
      try {
        const authResult = await auth();
        clerkUser = authResult.user;
      } catch (authError) {
        console.error('Auth error (POST, user creation):', authError);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
        }
      });
    }

    const submission = await prisma.submission.create({
      data: {
        theaterName,
        scriptTitle,
        submissionDate: new Date(submissionDate),
        deadline: deadline ? new Date(deadline) : null,
        status,
        fee: fee ? parseFloat(fee) : null,
        contactPerson,
        contactEmail,
        notes,
        responseDate: responseDate ? new Date(responseDate) : null,
        userId: user.id
      }
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 