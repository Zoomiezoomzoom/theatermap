import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { sendStatusUpdateNotification, updateCalendarEvent } from '@/lib/notifications';

// GET /api/submissions/[id] - Get a specific submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching submission:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/submissions/[id] - Update a submission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing submission to check for status changes
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const oldStatus = existingSubmission.status;

    // Update the submission
    const submission = await prisma.submission.update({
      where: { id: id },
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
        updatedAt: new Date()
      }
    });

    // Send status update notification if status changed
    if (oldStatus !== status) {
      try {
        await sendStatusUpdateNotification(id, oldStatus, status);
      } catch (error) {
        console.error('Failed to send status update notification:', error);
        // Don't fail the update if notification fails
      }
    }

    // Update calendar event if deadline or status changed
    const changes: any = {};
    if (oldStatus !== status) changes.status = status;
    if (existingSubmission.deadline?.toISOString() !== deadline) changes.deadline = deadline;
    
    if (Object.keys(changes).length > 0) {
      try {
        await updateCalendarEvent(id, changes);
      } catch (error) {
        console.error('Failed to update calendar event:', error);
        // Don't fail the update if calendar fails
      }
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating submission:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/submissions/[id] - Delete a submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if submission exists and belongs to user
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Delete the submission
    await prisma.submission.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error deleting submission:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 