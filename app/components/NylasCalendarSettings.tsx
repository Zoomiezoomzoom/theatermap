"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function NylasCalendarSettings() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for errors from the redirect first
    const err = searchParams.get('calendar_error');
    const errorMessage = searchParams.get('error');
    if (err || errorMessage) {
      setError(errorMessage || 'Failed to connect calendar. Please try again.');
    }

    // Fetch the user's connection status from our API
    const checkConnectionStatus = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user?clerkId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.nylasGrantId) {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        } else {
          // If the request fails, assume not connected
          setIsConnected(false);
        }
      } catch (e) {
        console.error('Failed to fetch user status', e);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, [searchParams, user]);

  const connectCalendar = () => {
    if (!user) {
      setError('Could not find user information. Please try again.');
      return;
    }
    window.location.href = `/api/nylas/auth/connect?clerkId=${user.id}`;
  };

  const disconnectCalendar = () => {
    // TODO: Implement disconnect logic
    // This would involve calling an API to delete the user's nylasGrantId
    setIsConnected(false);
    setError('');
  };

  if (!user) {
    return (
      <div className="bg-notion-bg rounded-xl border border-notion-border p-6 text-center">
        <p className="text-notion-text-light">Loading user...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-notion-bg rounded-xl border border-notion-border p-6 text-center">
        <p className="text-notion-text-light">Loading Calendar Settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-notion-bg rounded-xl border border-notion-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-notion-text">Calendar Integration</h3>
          <p className="text-sm text-notion-text-light">
            Connect your calendar to automatically add submission deadlines and reminders
          </p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ Calendar connected successfully.
            </p>
          </div>
          <button
            onClick={disconnectCalendar}
            className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Disconnect Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-notion-text-light">
            Connect your Google Calendar, Outlook, or other calendar service to automatically sync submission deadlines.
          </p>
          <button
            onClick={connectCalendar}
            className="w-full bg-notion-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-notion-accent-hover transition-colors text-sm"
          >
            Connect Calendar
          </button>
        </div>
      )}
    </div>
  );
} 