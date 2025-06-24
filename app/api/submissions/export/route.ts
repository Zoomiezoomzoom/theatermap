import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/submissions/export - Export submissions in various formats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      const { user: clerkUser } = await auth();
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

    // Build where clause
    const where: any = { userId: user.id };
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.submissionDate = {};
      if (startDate) where.submissionDate.gte = new Date(startDate);
      if (endDate) where.submissionDate.lte = new Date(endDate);
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { submissionDate: 'desc' }
    });

    if (format === 'json') {
      return NextResponse.json(submissions);
    }

    if (format === 'csv') {
      const csvContent = generateCSV(submissions);
      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="submissions-${new Date().toISOString().split('T')[0]}.csv"`);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateCSV(submissions: any[]): string {
  const headers = [
    'Theater Name',
    'Script Title', 
    'Submission Date',
    'Deadline',
    'Status',
    'Fee',
    'Contact Person',
    'Contact Email',
    'Notes',
    'Response Date'
  ];

  const rows = submissions.map(sub => [
    escapeCSVField(sub.theaterName),
    escapeCSVField(sub.scriptTitle),
    sub.submissionDate ? new Date(sub.submissionDate).toISOString().split('T')[0] : '',
    sub.deadline ? new Date(sub.deadline).toISOString().split('T')[0] : '',
    sub.status,
    sub.fee ? `$${sub.fee}` : 'Free',
    escapeCSVField(sub.contactPerson || ''),
    escapeCSVField(sub.contactEmail || ''),
    escapeCSVField(sub.notes || ''),
    sub.responseDate ? new Date(sub.responseDate).toISOString().split('T')[0] : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
}

function escapeCSVField(field: string): string {
  if (!field) return '';
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = field.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
} 