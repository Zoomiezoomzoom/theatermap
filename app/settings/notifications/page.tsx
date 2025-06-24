"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { 
  Bell, 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Settings,
  TestTube,
  Save
} from "lucide-react";

interface NotificationPreferences {
  id: string;
  userId: string;
  deadlineReminders: boolean;
  deadlineReminderDays: number[];
  overdueNotifications: boolean;
  statusUpdates: boolean;
  weeklyDigest: boolean;
  emailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationSettingsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      loadPreferences();
    }
  }, [isSignedIn, user]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: value
      });
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast.success('Notification preferences saved successfully');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast.error('No email address found');
      return;
    }

    setTestingEmail(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.emailAddresses[0].emailAddress 
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Test email sent! Check your inbox.');
      } else {
        toast.error(`Failed to send test email: ${result.details || result.error}`);
      }
    } catch (error) {
      console.error('Test email failed:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-accent mx-auto mb-4"></div>
          <p className="text-notion-text-light">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-notion-text mb-4">Sign in to manage notifications</h1>
          <p className="text-notion-text-light mb-6">
            Configure your email preferences and notification settings.
          </p>
          <button
            onClick={() => window.location.href = '/sign-in'}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center">
          <p className="text-notion-text-light">Failed to load preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 pt-24">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-notion-accent/10 rounded-lg">
              <Bell className="w-6 h-6 text-notion-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-notion-text">
                Notification Settings
              </h1>
              <p className="text-notion-text-light">
                Manage your email preferences and notification schedule
              </p>
            </div>
          </div>
        </div>

        {/* Email Configuration Test */}
        <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-notion-accent" />
              <h2 className="text-lg font-semibold text-notion-text">Email Configuration</h2>
            </div>
            <button
              onClick={testEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 transition-colors"
            >
              <TestTube size={16} />
              {testingEmail ? 'Sending...' : 'Test Email'}
            </button>
          </div>
          
          <div className="space-y-2 text-sm text-notion-text-light">
            <p><strong>Email Address:</strong> {user?.emailAddresses?.[0]?.emailAddress}</p>
            <p><strong>From Address:</strong> notifications@{process.env.NEXT_PUBLIC_EMAIL_FROM_DOMAIN || 'ascend.com'}</p>
            <p className="text-xs text-notion-text-light/75">
              Click "Test Email" to verify your email configuration is working properly.
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-notion-text flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </h2>

          {/* Master Toggle */}
          <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-notion-accent" />
                <div>
                  <h3 className="font-semibold text-notion-text">Email Notifications</h3>
                  <p className="text-sm text-notion-text-light">Enable or disable all email notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-notion-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-notion-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent"></div>
              </label>
            </div>
          </div>

          {/* Deadline Reminders */}
          <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-notion-accent" />
                <div>
                  <h3 className="font-semibold text-notion-text">Deadline Reminders</h3>
                  <p className="text-sm text-notion-text-light">Get notified before submission deadlines</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.deadlineReminders}
                  onChange={(e) => updatePreference('deadlineReminders', e.target.checked)}
                  disabled={!preferences.emailEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-notion-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-notion-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent disabled:opacity-50"></div>
              </label>
            </div>

            {preferences.deadlineReminders && (
              <div className="space-y-3">
                <p className="text-sm text-notion-text-light">Send reminders:</p>
                <div className="flex flex-wrap gap-2">
                  {[7, 3, 1, 0].map((days) => (
                    <label key={days} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.deadlineReminderDays.includes(days)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...preferences.deadlineReminderDays, days]
                            : preferences.deadlineReminderDays.filter(d => d !== days);
                          updatePreference('deadlineReminderDays', newDays);
                        }}
                        className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-border rounded focus:ring-notion-accent"
                      />
                      <span className="text-sm text-notion-text">
                        {days === 0 ? 'Due today' : `${days} day${days !== 1 ? 's' : ''} before`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Updates */}
          <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-notion-accent" />
                <div>
                  <h3 className="font-semibold text-notion-text">Status Updates</h3>
                  <p className="text-sm text-notion-text-light">Get notified when submission status changes</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.statusUpdates}
                  onChange={(e) => updatePreference('statusUpdates', e.target.checked)}
                  disabled={!preferences.emailEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-notion-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-notion-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Overdue Notifications */}
          <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-notion-accent" />
                <div>
                  <h3 className="font-semibold text-notion-text">Overdue Notifications</h3>
                  <p className="text-sm text-notion-text-light">Get notified when deadlines have passed</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.overdueNotifications}
                  onChange={(e) => updatePreference('overdueNotifications', e.target.checked)}
                  disabled={!preferences.emailEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-notion-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-notion-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Weekly Digest */}
          <div className="bg-notion-hover-bg rounded-xl p-6 border border-notion-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-notion-accent" />
                <div>
                  <h3 className="font-semibold text-notion-text">Weekly Digest</h3>
                  <p className="text-sm text-notion-text-light">Receive a weekly summary of your submissions</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => updatePreference('weeklyDigest', e.target.checked)}
                  disabled={!preferences.emailEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-notion-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-notion-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-notion-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-notion-accent disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
} 