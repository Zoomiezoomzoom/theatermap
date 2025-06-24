"use client";

import { NotificationSettings } from "@/app/components/NotificationSettings";
import { NotificationTest } from "@/app/components/NotificationTest";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function NotificationsSettingsPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-accent mx-auto mb-4"></div>
          <p className="text-notion-text-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 pt-24">
        <NotificationSettings />
        <NotificationTest />
      </div>
    </div>
  );
} 