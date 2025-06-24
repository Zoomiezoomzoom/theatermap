"use client";

import { UserProfile } from '@clerk/nextjs';
import { NylasCalendarSettings } from '../../components/NylasCalendarSettings';

const SettingsPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
    <div className="w-full max-w-4xl p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8">
        <NylasCalendarSettings />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          <div className="flex justify-center">
            <UserProfile path="/settings" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPage;