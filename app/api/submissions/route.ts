import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/submissions - Get all submissions for the authenticated user
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      const clerkUser = await currentUser();
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching submissions:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
      console.error('JSON parse error (POST):', errorMessage);
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
      const clerkUser = await currentUser();
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating submission:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 