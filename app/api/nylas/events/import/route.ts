import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Smart event filtering and detection
const filterSubmissionEvents = (events: any[]) => {
  const submissionKeywords = [
    // Theater-specific
    'theater', 'theatre', 'playhouse', 'rep', 'company',
    // Submission-specific
    'submission', 'submit', 'deadline', 'due', 'response',
    // Play-specific
    'play', 'script', 'playwright', 'drama', 'comedy',
    // Contest-specific
    'contest', 'competition', 'festival', 'reading'
  ];
  
  const timeKeywords = [
    'deadline', 'due', 'response', 'follow up', 'followup'
  ];
  
  return events.filter(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const location = (event.location || '').toLowerCase();
    
    const content = `${title} ${description} ${location}`;
    
    // Check for submission keywords
    const hasSubmissionKeyword = submissionKeywords.some(keyword => 
      content.includes(keyword)
    );
    
    // Check for deadline/response patterns
    const hasTimeKeyword = timeKeywords.some(keyword => 
      content.includes(keyword)
    );
    
    // Score the relevance
    let relevanceScore = 0;
    if (hasSubmissionKeyword) relevanceScore += 2;
    if (hasTimeKeyword) relevanceScore += 1;
    if (title.includes('submit')) relevanceScore += 2;
    if (description.includes('theater') || description.includes('theatre')) relevanceScore += 1;
    
    return relevanceScore >= 2;
  }).map(event => ({
    ...event,
    relevanceScore: calculateRelevanceScore(event)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

const calculateRelevanceScore = (event: any) => {
  let score = 0;
  const title = (event.title || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  
  // High confidence patterns
  if (title.includes('submission deadline')) score += 5;
  if (title.includes('response due')) score += 5;
  if (title.includes('submit to')) score += 4;
  
  // Medium confidence patterns
  if (title.includes('theater') || title.includes('theatre')) score += 3;
  if (description.includes('script')) score += 2;
  if (description.includes('playwright')) score += 2;
  
  // Context clues
  if (event.participants?.length > 0) score += 1;
  if (event.location) score += 1;
  
  return score;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user?.nylasGrantId) {
      return NextResponse.json({ error: 'Nylas not connected' }, { status: 400 });
    }

    // For now, return mock data since Nylas integration needs to be set up
    // In a real implementation, this would call the Nylas API
    const mockEvents = [
      {
        id: '1',
        title: 'Submit to Magic Theatre',
        description: 'Deadline for new play submissions. Script: "The Last Act"',
        location: 'Magic Theatre, San Francisco',
        when: {
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
        participants: [
          { email: 'literary@magictheatre.org', name: 'Literary Manager' }
        ],
        calendar_id: 'primary'
      },
      {
        id: '2',
        title: 'Response Due - Playwrights Foundation',
        description: 'Response expected for "Summer Dreams" submission',
        location: 'Playwrights Foundation',
        when: {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        },
        participants: [],
        calendar_id: 'primary'
      },
      {
        id: '3',
        title: 'Theater Festival Deadline',
        description: 'Submit your one-act play for the annual festival. Fee: $25',
        location: 'Bay Area Theater Festival',
        when: {
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        },
        participants: [],
        calendar_id: 'primary'
      }
    ];

    // Filter events that fall within the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filteredEvents = mockEvents.filter(event => {
      const eventDate = new Date(event.when.date || event.when.start_date || '');
      return eventDate >= start && eventDate <= end;
    });

    // Apply smart filtering
    const submissionEvents = filterSubmissionEvents(filteredEvents);

    return NextResponse.json(submissionEvents);
  } catch (error) {
    console.error('Error fetching calendar events for import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 