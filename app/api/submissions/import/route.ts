import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// POST /api/submissions/import - Import submissions from CSV
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissions, columnMapping } = body;

    if (!submissions || !Array.isArray(submissions)) {
      return NextResponse.json({ error: 'Invalid submissions data' }, { status: 400 });
    }

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

    // Validate and transform submissions
    const validationResult = validateSubmissions(submissions, columnMapping);
    
    if (validationResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        errors: validationResult.errors 
      }, { status: 400 });
    }

    // Create submissions in a transaction
    const createdSubmissions = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const submissionData of validationResult.validSubmissions) {
        const submission = await tx.submission.create({
          data: {
            ...submissionData,
            userId: user.id
          }
        });
        results.push(submission);
      }
      
      return results;
    });

    return NextResponse.json({
      message: `Successfully imported ${createdSubmissions.length} submissions`,
      imported: createdSubmissions.length,
      warnings: validationResult.warnings,
      submissions: createdSubmissions
    }, { status: 201 });

  } catch (error) {
    console.error('Error importing submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function validateSubmissions(submissions: any[], columnMapping: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validSubmissions: any[] = [];

  submissions.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // Map CSV columns to submission fields
    const mappedData = mapCSVRow(row, columnMapping);
    
    // Validate required fields
    if (!mappedData.theaterName) {
      errors.push(`Row ${rowNumber}: Theater name is required`);
      return;
    }
    
    if (!mappedData.scriptTitle) {
      errors.push(`Row ${rowNumber}: Script title is required`);
      return;
    }
    
    if (!mappedData.submissionDate) {
      errors.push(`Row ${rowNumber}: Submission date is required`);
      return;
    }

    // Validate dates
    if (mappedData.submissionDate && !isValidDate(mappedData.submissionDate)) {
      errors.push(`Row ${rowNumber}: Invalid submission date format`);
      return;
    }
    
    if (mappedData.deadline && !isValidDate(mappedData.deadline)) {
      warnings.push(`Row ${rowNumber}: Invalid deadline date format - will be ignored`);
      mappedData.deadline = null;
    }
    
    if (mappedData.responseDate && !isValidDate(mappedData.responseDate)) {
      warnings.push(`Row ${rowNumber}: Invalid response date format - will be ignored`);
      mappedData.responseDate = null;
    }

    // Validate fee
    if (mappedData.fee !== null && mappedData.fee !== undefined) {
      const feeNum = parseFloat(mappedData.fee);
      if (isNaN(feeNum) || feeNum < 0) {
        warnings.push(`Row ${rowNumber}: Invalid fee amount - will be set to 0`);
        mappedData.fee = null;
      } else {
        mappedData.fee = feeNum;
      }
    }

    // Normalize status
    if (mappedData.status) {
      mappedData.status = normalizeStatus(mappedData.status);
    } else {
      mappedData.status = 'Submitted'; // Default status
    }

    // Convert dates to Date objects
    if (mappedData.submissionDate) {
      mappedData.submissionDate = new Date(mappedData.submissionDate);
    }
    
    if (mappedData.deadline) {
      mappedData.deadline = new Date(mappedData.deadline);
    }
    
    if (mappedData.responseDate) {
      mappedData.responseDate = new Date(mappedData.responseDate);
    }

    validSubmissions.push(mappedData);
  });

  return { errors, warnings, validSubmissions };
}

function mapCSVRow(row: any, columnMapping: any) {
  const mapped: any = {};
  
  // Map each field using the column mapping
  Object.keys(columnMapping).forEach(field => {
    const csvColumn = columnMapping[field];
    if (csvColumn && row[csvColumn] !== undefined) {
      mapped[field] = row[csvColumn];
    }
  });
  
  return mapped;
}

function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function normalizeStatus(status: string): string {
  const statusLower = status.toLowerCase().trim();
  
  const statusMap: { [key: string]: string } = {
    'submitted': 'Submitted',
    'under review': 'Under Review',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'no response': 'No Response',
    'pending': 'Under Review',
    'in review': 'Under Review',
    'approved': 'Accepted',
    'declined': 'Rejected'
  };
  
  return statusMap[statusLower] || 'Submitted';
} 