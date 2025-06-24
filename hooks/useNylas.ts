"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface NylasEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  when: {
    date?: string;
    start_date?: string;
    end_date?: string;
  };
  participants?: Array<{
    email?: string;
    name?: string;
  }>;
  calendar_id?: string;
}

export interface ParsedSubmission {
  theaterName: string;
  scriptTitle?: string;
  submissionDate?: string;
  deadline?: string;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'No Response';
  fee?: number;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  calendarEventId: string;
  confidence: number;
  needsReview: boolean;
  isDuplicate?: boolean;
  originalEventTitle: string;
}

export function useNylas() {
  const { userId } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check Nylas connection status
  const checkConnection = useCallback(async () => {
    if (!userId) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/nylas/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to check Nylas connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch calendar events for import
  const fetchCalendarEventsForImport = useCallback(async (
    startDate: Date, 
    endDate: Date
  ): Promise<NylasEvent[]> => {
    if (!isConnected) {
      throw new Error('Nylas not connected. Please connect your calendar first.');
    }

    try {
      const response = await fetch('/api/nylas/events/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch calendar events');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      throw new Error('Could not access calendar. Please reconnect your calendar.');
    }
  }, [isConnected]);

  // Create calendar event
  const createEvent = useCallback(async (submission: {
    id: string;
    theaterName: string;
    scriptTitle: string;
    submissionDate: string;
    deadline: string;
    notes?: string;
  }) => {
    if (!isConnected) {
      throw new Error('Nylas not connected');
    }

    try {
      const response = await fetch('/api/nylas/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          title: `Submission Deadline: ${submission.theaterName}`,
          description: `Script: ${submission.scriptTitle}\n\n${submission.notes || ''}`,
          startTime: new Date(submission.deadline).toISOString(),
          endTime: new Date(new Date(submission.deadline).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          reminders: [
            { type: 'email', minutes: 24 * 60 }, // 1 day before
            { type: 'popup', minutes: 60 }, // 1 hour before
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create calendar event');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }, [isConnected]);

  // Import submissions from calendar events
  const importSubmissionsFromCalendar = useCallback(async (
    submissions: ParsedSubmission[]
  ): Promise<{ imported: number; warnings: string[] }> => {
    try {
      const response = await fetch('/api/submissions/import/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import submissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to import submissions from calendar:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    checkConnection,
    fetchCalendarEventsForImport,
    createEvent,
    importSubmissionsFromCalendar,
  };
} 