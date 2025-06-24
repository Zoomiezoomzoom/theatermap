import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import type { ParsedSubmission } from '@/hooks/useNylas';

// Parse event data into submission format
const parseEventToSubmission = (event: any): ParsedSubmission => {
  const title = event.title || '';
  const description = event.description || '';
  
  return {
    // Extract theater name
    theaterName: extractTheaterName(title, description),
    
    // Extract script title
    scriptTitle: extractScriptTitle(title, description),
    
    // Set deadline from event date
    deadline: event.when.date || event.when.start_date,
    
    // Determine submission date (estimate)
    submissionDate: estimateSubmissionDate(event.when.date || event.when.start_date),
    
    // Set status based on event timing
    status: determineStatusFromDate(event.when.date || event.when.start_date),
    
    // Extract contact info
    contactEmail: extractContactEmail(event.participants, description),
    contactPerson: extractContactPerson(event.participants, description),
    
    // Parse fee information
    fee: extractFee(description),
    
    // Store original event info
    notes: `Imported from calendar: "${title}"${description ? `\n\nOriginal description: ${description}` : ''}`,
    
    // Link back to calendar
    calendarEventId: event.id,
    
    // Import metadata
    originalEventTitle: title,
    confidence: calculateParsingConfidence(title, description),
    needsReview: false
  };
};

// Extract theater name with smart parsing
const extractTheaterName = (title: string, description: string): string => {
  // Common patterns in calendar events
  const patterns = [
    /submit(?:ting)? to (.+?)(?:\s|$)/i,
    /(.+?) (?:deadline|response|submission)/i,
    /(.+?) (?:theater|theatre|playhouse|rep|company)/i,
    /(?:deadline|response) (?:from|for) (.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      let theater = match[1].trim();
      // Clean up common suffixes
      theater = theater.replace(/\s+(deadline|response|submission)$/i, '');
      return theater;
    }
  }
  
  // Check description for theater names
  const descriptionMatch = description.match(/theater|theatre|playhouse/i);
  if (descriptionMatch) {
    // Extract surrounding context
    const words = description.split(/\s+/);
    const index = words.findIndex(word => /theater|theatre|playhouse/i.test(word));
    if (index > 0) {
      return `${words[index - 1]} ${words[index]}`.trim();
    }
  }
  
  return title; // Fallback
};

// Extract script title
const extractScriptTitle = (title: string, description: string): string | undefined => {
  // Look for quoted titles
  const quotedMatch = description.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];
  
  // Look for "Script:" or "Play:" patterns
  const scriptMatch = description.match(/(?:script|play):\s*([^\n]+)/i);
  if (scriptMatch) return scriptMatch[1].trim();
  
  // Return undefined if can't determine - user will need to fill this in
  return undefined;
};

// Estimate when the submission was made
const estimateSubmissionDate = (deadline: string): string | undefined => {
  if (!deadline) return undefined;
  
  const deadlineDate = new Date(deadline);
  // Assume submission was made 2-3 months before deadline
  const estimatedDate = new Date(deadlineDate);
  estimatedDate.setMonth(estimatedDate.getMonth() - 2);
  
  // Don't set future dates
  const now = new Date();
  return estimatedDate < now ? estimatedDate.toISOString().split('T')[0] : undefined;
};

// Determine status based on deadline timing
const determineStatusFromDate = (deadline: string): 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'No Response' => {
  if (!deadline) return 'Submitted';
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  if (deadlineDate < now) {
    // Deadline has passed
    return 'No Response';
  } else {
    // Deadline is upcoming
    return 'Submitted';
  }
};

// Extract contact email from participants or description
const extractContactEmail = (participants: any[], description: string): string | undefined => {
  if (participants?.length > 0) {
    const participant = participants.find(p => p.email);
    if (participant?.email) return participant.email;
  }
  
  // Look for email in description
  const emailMatch = description.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) return emailMatch[0];
  
  return undefined;
};

// Extract contact person from participants or description
const extractContactPerson = (participants: any[], description: string): string | undefined => {
  if (participants?.length > 0) {
    const participant = participants.find(p => p.name);
    if (participant?.name) return participant.name;
  }
  
  // Look for contact person in description
  const contactMatch = description.match(/(?:contact|literary manager|director):\s*([^\n]+)/i);
  if (contactMatch) return contactMatch[1].trim();
  
  return undefined;
};

// Extract fee information from description
const extractFee = (description: string): number | undefined => {
  const feeMatch = description.match(/\$(\d+(?:\.\d{2})?)/);
  if (feeMatch) return parseFloat(feeMatch[1]);
  
  if (/free|no fee|no charge/i.test(description)) return 0;
  
  return undefined; // Unknown fee
};

// Calculate parsing confidence
const calculateParsingConfidence = (title: string, description: string): number => {
  let confidence = 0;
  
  // High confidence indicators
  if (title.includes('submission') || title.includes('submit')) confidence += 3;
  if (title.includes('deadline') || title.includes('due')) confidence += 2;
  if (description.includes('script') || description.includes('play')) confidence += 2;
  if (description.includes('theater') || description.includes('theatre')) confidence += 2;
  
  // Medium confidence indicators
  if (title.includes('response')) confidence += 1;
  if (description.includes('playwright')) confidence += 1;
  if (description.includes('festival') || description.includes('contest')) confidence += 1;
  
  return Math.min(confidence, 5); // Cap at 5
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissions } = body;

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

    // Parse and validate submissions
    const parsedSubmissions = submissions.map((submission: ParsedSubmission) => {
      const parsed = {
        theaterName: submission.theaterName || 'Unknown Theater',
        scriptTitle: submission.scriptTitle || 'Untitled Script',
        submissionDate: submission.submissionDate || new Date().toISOString().split('T')[0],
        deadline: submission.deadline,
        status: submission.status,
        fee: submission.fee,
        contactPerson: submission.contactPerson,
        contactEmail: submission.contactEmail,
        notes: submission.notes,
        calendarEventId: submission.calendarEventId,
        userId: user.id
      };

      // Mark for review if missing critical info
      if (!submission.theaterName || !submission.scriptTitle) {
        parsed.notes = `${parsed.notes}\n\n⚠️ Needs review: Missing theater name or script title`;
      }

      return parsed;
    });

    // Create submissions in a transaction
    const createdSubmissions = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const submissionData of parsedSubmissions) {
        const submission = await tx.submission.create({
          data: {
            ...submissionData,
            submissionDate: new Date(submissionData.submissionDate),
            deadline: submissionData.deadline ? new Date(submissionData.deadline) : null,
          }
        });
        results.push(submission);
      }
      
      return results;
    });

    const warnings = [];
    if (parsedSubmissions.some(s => s.theaterName === 'Unknown Theater')) {
      warnings.push('Some submissions have unknown theater names and need review');
    }
    if (parsedSubmissions.some(s => s.scriptTitle === 'Untitled Script')) {
      warnings.push('Some submissions have untitled scripts and need review');
    }

    return NextResponse.json({
      message: `Successfully imported ${createdSubmissions.length} submissions from calendar`,
      imported: createdSubmissions.length,
      warnings,
      submissions: createdSubmissions
    }, { status: 201 });

  } catch (error) {
    console.error('Error importing submissions from calendar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 