import prisma from './prisma';
import { 
  sendDeadlineReminder, 
  sendWeeklyDigest, 
  sendStatusUpdateEmail,
  type EmailSubmission,
  type EmailUser,
  type UserNotificationPreferences,
  notificationTypes
} from './email';

// Check for upcoming deadlines and send notifications
export const checkUpcomingDeadlines = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);
  
  const sevenDays = new Date(today);
  sevenDays.setDate(sevenDays.getDate() + 7);
  
  // Find submissions with deadlines in 1, 3, or 7 days
  const upcomingSubmissions = await prisma.submission.findMany({
    where: {
      deadline: {
        in: [
          today.toISOString().split('T')[0],
          tomorrow.toISOString().split('T')[0],
          threeDays.toISOString().split('T')[0],
          sevenDays.toISOString().split('T')[0]
        ]
      },
      status: 'Submitted'
    },
    include: {
      user: {
        include: {
          notificationPreferences: true
        }
      }
    }
  });
  
  console.log(`Found ${upcomingSubmissions.length} submissions with upcoming deadlines`);
  
  // Send notifications
  for (const submission of upcomingSubmissions) {
    if (!submission.user.notificationPreferences?.deadlineReminders) {
      console.log(`Skipping notification for user ${submission.user.id} - deadline reminders disabled`);
      continue;
    }
    
    const deadline = new Date(submission.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if we should send notification for this number of days
    const reminderDays = submission.user.notificationPreferences?.deadlineReminderDays || [7, 3, 1];
    if (!reminderDays.includes(daysLeft)) {
      console.log(`Skipping notification for ${submission.theaterName} - ${daysLeft} days not in reminder preferences`);
      continue;
    }
    
    // Check if we've already sent this notification today
    const alreadySent = await prisma.notification.findFirst({
      where: {
        submissionId: submission.id,
        type: `deadline_${daysLeft}_days`,
        sentAt: {
          gte: new Date(today.toDateString()) // Today
        }
      }
    });
    
    if (alreadySent) {
      console.log(`Notification already sent today for ${submission.theaterName} - ${daysLeft} days`);
      continue;
    }
    
    try {
      const emailSubmission: EmailSubmission = {
        id: submission.id,
        theaterName: submission.theaterName,
        scriptTitle: submission.scriptTitle,
        submissionDate: submission.submissionDate,
        deadline: submission.deadline,
        status: submission.status,
        notes: submission.notes || undefined
      };
      
      const emailUser: EmailUser = {
        id: submission.user.id,
        email: submission.user.email,
        firstName: submission.user.firstName || undefined,
        lastName: submission.user.lastName || undefined
      };
      
      await sendDeadlineReminder(emailSubmission, emailUser, daysLeft);
      
      // Log the notification
      await prisma.notification.create({
        data: {
          userId: submission.user.id,
          submissionId: submission.id,
          type: `deadline_${daysLeft}_days`,
          sentAt: new Date(),
          status: 'sent'
        }
      });
      
      console.log(`Sent deadline reminder for ${submission.theaterName} - ${daysLeft} days remaining`);
    } catch (error) {
      console.error(`Failed to send deadline reminder for ${submission.theaterName}:`, error);
      
      // Log the failed notification
      await prisma.notification.create({
        data: {
          userId: submission.user.id,
          submissionId: submission.id,
          type: `deadline_${daysLeft}_days`,
          sentAt: new Date(),
          status: 'failed'
        }
      });
    }
  }
};

// Send weekly digest emails
export const sendWeeklyDigests = async () => {
  const users = await prisma.user.findMany({
    where: {
      notificationPreferences: {
        weeklyDigest: true
      }
    },
    include: {
      submissions: {
        where: {
          OR: [
            {
              deadline: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
              }
            },
            {
              deadline: {
                lt: new Date()
              },
              status: 'Submitted'
            }
          ]
        }
      }
    }
  });
  
  console.log(`Found ${users.length} users for weekly digest`);
  
  for (const user of users) {
    if (user.submissions.length === 0) {
      console.log(`Skipping weekly digest for user ${user.id} - no relevant submissions`);
      continue;
    }
    
    try {
      const emailSubmissions: EmailSubmission[] = user.submissions.map(sub => ({
        id: sub.id,
        theaterName: sub.theaterName,
        scriptTitle: sub.scriptTitle,
        submissionDate: sub.submissionDate,
        deadline: sub.deadline,
        status: sub.status,
        notes: sub.notes || undefined
      }));
      
      const emailUser: EmailUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined
      };
      
      await sendWeeklyDigest(emailUser, emailSubmissions);
      
      // Log the notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'weekly_digest',
          sentAt: new Date(),
          status: 'sent'
        }
      });
      
      console.log(`Sent weekly digest to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send weekly digest to ${user.email}:`, error);
      
      // Log the failed notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'weekly_digest',
          sentAt: new Date(),
          status: 'failed'
        }
      });
    }
  }
};

// Send status update notification
export const sendStatusUpdateNotification = async (
  submissionId: string,
  oldStatus: string,
  newStatus: string
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        include: {
          notificationPreferences: true
        }
      }
    }
  });
  
  if (!submission) {
    console.error(`Submission ${submissionId} not found`);
    return;
  }
  
  if (!submission.user.notificationPreferences?.statusUpdates) {
    console.log(`Skipping status update for user ${submission.user.id} - status updates disabled`);
    return;
  }
  
  try {
    const emailSubmission: EmailSubmission = {
      id: submission.id,
      theaterName: submission.theaterName,
      scriptTitle: submission.scriptTitle,
      submissionDate: submission.submissionDate,
      deadline: submission.deadline,
      status: submission.status,
      notes: submission.notes || undefined
    };
    
    const emailUser: EmailUser = {
      id: submission.user.id,
      email: submission.user.email,
      firstName: submission.user.firstName || undefined,
      lastName: submission.user.lastName || undefined
    };
    
    await sendStatusUpdateEmail(emailSubmission, emailUser, oldStatus, newStatus);
    
    // Log the notification
    await prisma.notification.create({
      data: {
        userId: submission.user.id,
        submissionId: submission.id,
        type: 'status_changed',
        sentAt: new Date(),
        status: 'sent'
      }
    });
    
    console.log(`Sent status update for ${submission.theaterName}: ${oldStatus} → ${newStatus}`);
  } catch (error) {
    console.error(`Failed to send status update for ${submission.theaterName}:`, error);
    
    // Log the failed notification
    await prisma.notification.create({
      data: {
        userId: submission.user.id,
        submissionId: submission.id,
        type: 'status_changed',
        sentAt: new Date(),
        status: 'failed'
      }
    });
  }
};

// Update calendar event when submission changes
export const updateCalendarEvent = async (submissionId: string, changes: any) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { user: true }
  });
  
  if (!submission || !submission.calendarEventId || !submission.user.nylasGrantId) {
    return;
  }
  
  try {
    // Import nylas dynamically to avoid issues
    const nylas = (await import('./nylas')).default;
    
    // Determine what changed
    const eventUpdates: any = {};
    
    if (changes.deadline) {
      const deadlineDate = new Date(changes.deadline);
      eventUpdates.when = { 
        startTime: Math.floor(deadlineDate.getTime() / 1000),
        endTime: Math.floor(deadlineDate.getTime() / 1000) + 3600 // 1 hour later
      };
    }
    
    if (changes.status) {
      eventUpdates.title = generateEventTitle(submission.theaterName, changes.status);
      eventUpdates.description = generateEventDescription(submission, changes.status);
    }
    
    // Update the calendar event
    await nylas.events.update({
      identifier: submission.user.nylasGrantId,
      eventId: submission.calendarEventId,
      requestBody: eventUpdates
    });
    
    console.log(`Updated calendar event for ${submission.theaterName}`);
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    // Don't fail the submission update if calendar fails
  }
};

// Generate updated event titles based on status
const generateEventTitle = (theaterName: string, status: string) => {
  switch (status) {
    case 'Accepted':
      return `✅ ACCEPTED: ${theaterName}`;
    case 'Rejected':
      return `❌ Response from ${theaterName}`;
    case 'No Response':
      return `⏰ Follow up: ${theaterName}`;
    default:
      return `${theaterName} Response Due`;
  }
};

// Generate event description
const generateEventDescription = (submission: any, status: string) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  return `
    Script: ${submission.scriptTitle}
    Status: ${status}
    Submitted: ${new Date(submission.submissionDate).toLocaleDateString()}
    Deadline: ${new Date(submission.deadline).toLocaleDateString()}
    
    View in TheaterMap: ${appUrl}/dashboard
  `;
};

// Create follow-up calendar events
export const createFollowUpEvent = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { user: true }
  });
  
  if (!submission || !submission.user.nylasGrantId) {
    return;
  }
  
  try {
    const nylas = (await import('./nylas')).default;
    
    const followUpDate = new Date(submission.deadline);
    followUpDate.setDate(followUpDate.getDate() + 30); // 30 days after deadline
    
    const event = await nylas.events.create({
      identifier: submission.user.nylasGrantId,
      requestBody: {
        title: `Follow-up: ${submission.theaterName}`,
        description: `
          Consider following up on "${submission.scriptTitle}" submission.
          Original deadline: ${new Date(submission.deadline).toLocaleDateString()}
          
          Submitted: ${new Date(submission.submissionDate).toLocaleDateString()}
          
          View in TheaterMap: ${process.env.APP_URL || 'http://localhost:3000'}/dashboard
        `,
        when: {
          startTime: Math.floor(followUpDate.getTime() / 1000),
          endTime: Math.floor(followUpDate.getTime() / 1000) + 3600
        },
        reminders: {
          useDefault: false,
          overrides: [
            { reminderMinutes: 60, reminderMethod: 'popup' }
          ]
        }
      }
    });
    
    // Store follow-up event ID with submission
    await prisma.submission.update({
      where: { id: submissionId },
      data: { followUpEventId: event.data.id }
    });
    
    console.log(`Created follow-up event for ${submission.theaterName}`);
  } catch (error) {
    console.error('Failed to create follow-up event:', error);
  }
};

// Check for upcoming deadlines and send reminders
export const checkDeadlinesAndSendReminders = async () => {
  console.log('Checking for upcoming deadlines...');
  
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all submissions with deadlines in the next 7 days
    const upcomingDeadlines = await prisma.submission.findMany({
      where: {
        deadline: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        status: {
          in: ['Submitted', 'Under Review'] // Only active submissions
        }
      },
      include: {
        user: {
          include: {
            notificationPreferences: true
          }
        }
      }
    });

    console.log(`Found ${upcomingDeadlines.length} submissions with upcoming deadlines`);

    for (const submission of upcomingDeadlines) {
      const daysUntilDeadline = Math.ceil(
        (new Date(submission.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if user has deadline reminders enabled
      const preferences = submission.user.notificationPreferences;
      if (!preferences?.deadlineReminders) {
        console.log(`Skipping ${submission.id} - deadline reminders disabled for user ${submission.userId}`);
        continue;
      }

      // Check if we should send a reminder for this number of days
      if (!preferences.deadlineReminderDays.includes(daysUntilDeadline)) {
        console.log(`Skipping ${submission.id} - ${daysUntilDeadline} days not in reminder schedule`);
        continue;
      }

      // Check if we've already sent a notification for this deadline
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: submission.userId,
          submissionId: submission.id,
          type: `deadline_${daysUntilDeadline}_days`,
          sentAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
          }
        }
      });

      if (existingNotification) {
        console.log(`Skipping ${submission.id} - notification already sent for ${daysUntilDeadline} days`);
        continue;
      }

      // Send the reminder
      try {
        console.log(`Sending ${daysUntilDeadline}-day reminder for submission ${submission.id}`);
        await sendDeadlineReminder(submission, submission.user, daysUntilDeadline);
        console.log(`Successfully sent reminder for submission ${submission.id}`);
      } catch (error) {
        console.error(`Failed to send reminder for submission ${submission.id}:`, error);
      }
    }

    console.log('Deadline check completed');
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

// Create or update notification preferences
export const updateNotificationPreferences = async (
  userId: string, 
  preferences: {
    deadlineReminders?: boolean;
    deadlineReminderDays?: number[];
    overdueNotifications?: boolean;
    statusUpdates?: boolean;
    weeklyDigest?: boolean;
    emailEnabled?: boolean;
  }
) => {
  try {
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
        deadlineReminderDays: preferences.deadlineReminderDays || [7, 3, 1],
        deadlineReminders: preferences.deadlineReminders ?? true,
        overdueNotifications: preferences.overdueNotifications ?? true,
        statusUpdates: preferences.statusUpdates ?? true,
        weeklyDigest: preferences.weeklyDigest ?? true,
        emailEnabled: preferences.emailEnabled ?? true,
      }
    });

    return updatedPreferences;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
};

// Get notification preferences for a user
export const getNotificationPreferences = async (userId: string) => {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences
      return await updateNotificationPreferences(userId, {});
    }

    return preferences;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    throw error;
  }
};

// Get notification history for a user
export const getNotificationHistory = async (userId: string, limit = 50) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        submission: {
          select: {
            theaterName: true,
            scriptTitle: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit
    });

    return notifications;
  } catch (error) {
    console.error('Failed to get notification history:', error);
    throw error;
  }
}; 