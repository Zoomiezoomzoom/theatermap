# Email and Calendar Notification System

This document describes the comprehensive email and calendar notification system implemented for the TheaterMap application.

## Overview

The notification system provides automated email reminders and calendar updates to help users stay on top of their theater submissions. It includes:

- **Deadline Reminders**: Automated emails sent 7, 3, and 1 day before submission deadlines
- **Status Updates**: Notifications when submission status changes (Accepted, Rejected, etc.)
- **Weekly Digests**: Summary emails with upcoming deadlines and overdue responses
- **Calendar Integration**: Automatic calendar event creation and updates via Nylas
- **User Preferences**: Granular control over notification types and timing

## Components

### 1. Email Service (`lib/email.ts`)

Handles all email sending using Resend:
- `sendDeadlineReminder()` - Sends deadline reminder emails
- `sendWeeklyDigest()` - Sends weekly summary emails
- `sendStatusUpdate()` - Sends status change notifications
- Email templates with responsive HTML design

### 2. Notification System (`lib/notifications.ts`)

Core notification logic:
- `checkUpcomingDeadlines()` - Finds and processes upcoming deadlines
- `sendWeeklyDigests()` - Processes weekly digest emails
- `sendStatusUpdateNotification()` - Handles status change notifications
- `updateCalendarEvent()` - Updates calendar events when submissions change
- `createFollowUpEvent()` - Creates follow-up calendar events

### 3. Cron Jobs (`lib/cron.ts`)

Automated scheduling:
- Daily deadline checks at 9 AM Pacific Time
- Weekly digests on Sundays at 8 AM Pacific Time
- Manual trigger functions for testing

### 4. Database Schema

New tables added to Prisma schema:
- `NotificationPreferences` - User notification settings
- `Notification` - Log of sent notifications
- Updated `User` and `Submission` models with relationships

### 5. API Routes

- `/api/notifications/preferences` - Manage user notification preferences
- `/api/notifications/trigger` - Manual trigger for testing
- `/api/test-email` - Test email functionality

### 6. UI Components

- `NotificationSettings` - Settings interface for user preferences
- `NotificationTest` - Testing interface for verification

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:
```bash
# Email service (Resend)
RESEND_API_KEY=your_resend_api_key

# App URL for email links
APP_URL=http://localhost:3000

# Enable cron jobs in development (optional)
ENABLE_CRON=true
```

### 2. Database Migration

Run the migration to add notification tables:
```bash
npx prisma migrate dev --name add_notification_system
```

### 3. Initialize Cron Jobs

Add to your app initialization (e.g., in `app/layout.tsx` or server startup):
```typescript
import { initCronJobs } from '@/lib/cron-init';

// Initialize cron jobs
initCronJobs();
```

### 4. Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain or use the sandbox domain for testing
4. Update the `from` email in `lib/email.ts` to match your verified domain

## Usage

### User Notification Preferences

Users can manage their notification preferences at `/settings/notifications`:

- **Deadline Reminders**: Toggle on/off and select reminder days (7, 3, 1 days)
- **Status Updates**: Get notified when submission status changes
- **Overdue Notifications**: Reminders when deadlines pass without response
- **Weekly Digest**: Sunday summary of upcoming deadlines and overdue responses
- **Email Enabled**: Master toggle for all email notifications

### Testing

Use the test interface at `/settings/notifications` to:
- Send test emails
- Trigger deadline checks
- Test weekly digests

### Manual Triggers

API endpoints for manual testing:
```bash
# Trigger deadline check
curl -X POST /api/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "deadline"}'

# Trigger weekly digest
curl -X POST /api/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly"}'
```

## Calendar Integration

The system automatically:
1. Creates calendar events when submissions are added with deadlines
2. Updates event titles and descriptions when status changes
3. Creates follow-up events 30 days after deadlines
4. Integrates with Nylas for calendar sync

## Email Templates

All emails use responsive HTML templates with:
- Clean, professional design
- TheaterMap branding
- Direct links to dashboard
- Unsubscribe/preferences management links
- Mobile-friendly layout

## Monitoring and Logging

The system logs all notification activities:
- Successful email sends
- Failed attempts
- User preferences changes
- Calendar event updates

Check the console logs for detailed information about notification processing.

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for email sending
2. **Error Handling**: Robust error handling for failed notifications
3. **Monitoring**: Set up monitoring for cron job execution
4. **Scaling**: Consider using a job queue for high-volume scenarios
5. **Compliance**: Ensure email compliance (CAN-SPAM, GDPR)

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check Resend API key and domain verification
2. **Cron jobs not running**: Verify `ENABLE_CRON=true` in development
3. **Database errors**: Run Prisma migrations and check schema
4. **Calendar sync issues**: Verify Nylas configuration and grant IDs

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_NOTIFICATIONS=true
```

This will provide detailed console output for notification processing.

## Future Enhancements

- SMS notifications via Twilio
- Push notifications for mobile apps
- Advanced email templates with dynamic content
- Notification analytics and reporting
- Bulk notification management
- Integration with external calendar services (Google Calendar, Outlook) 