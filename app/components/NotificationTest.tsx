"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Bell, Mail, TestTube } from "lucide-react";

export function NotificationTest() {
  const { isSignedIn } = useAuth();
  const [isTesting, setIsTesting] = useState(false);

  const testEmail = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to test notifications');
      return;
    }

    try {
      setIsTesting(true);
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Test email sent! Check your inbox.');
        console.log('Test email result:', data);
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const testDeadlineCheck = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to test notifications');
      return;
    }

    try {
      setIsTesting(true);
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deadline' })
      });

      if (response.ok) {
        toast.success('Deadline check triggered!');
      } else {
        throw new Error('Failed to trigger deadline check');
      }
    } catch (error) {
      console.error('Error testing deadline check:', error);
      toast.error('Failed to trigger deadline check');
    } finally {
      setIsTesting(false);
    }
  };

  const testWeeklyDigest = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to test notifications');
      return;
    }

    try {
      setIsTesting(true);
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weekly' })
      });

      if (response.ok) {
        toast.success('Weekly digest triggered!');
      } else {
        throw new Error('Failed to trigger weekly digest');
      }
    } catch (error) {
      console.error('Error testing weekly digest:', error);
      toast.error('Failed to trigger weekly digest');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-notion-bg border border-notion-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <TestTube className="w-5 h-5 text-notion-accent" />
        <h3 className="text-lg font-semibold text-notion-text">Test Notifications</h3>
      </div>
      
      <p className="text-sm text-notion-text-light mb-4">
        Test the notification system to make sure everything is working correctly.
      </p>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={testEmail}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Mail size={16} />
          Test Email
        </button>
        
        <button
          onClick={testDeadlineCheck}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Bell size={16} />
          Test Deadline Check
        </button>
        
        <button
          onClick={testWeeklyDigest}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Mail size={16} />
          Test Weekly Digest
        </button>
      </div>
      
      {isTesting && (
        <div className="flex items-center gap-2 mt-4 text-sm text-notion-accent">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-notion-accent"></div>
          Testing notification...
        </div>
      )}
    </div>
  );
} 