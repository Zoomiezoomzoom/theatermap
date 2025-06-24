import { Resend } from 'resend';
import prisma from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email service configuration
const EMAIL_CONFIG = {
  from: `Ascend <notifications@${process.env.EMAIL_FROM_DOMAIN || 'ascending.live'}>`,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

// Email templates
export const emailTemplates = {
  deadlineReminder: {
    subject: (theaterName: string, daysLeft: number) => 
      `Reminder: ${theaterName} response due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    template: 'deadline-reminder'
  },
  overdue: {
    subject: (theaterName: string) => 
      `Follow-up suggestion: ${theaterName} deadline passed`,
    template: 'overdue-followup'
  },
  statusUpdate: {
    subject: (theaterName: string, status: string) => 
      `Submission update: ${theaterName} - ${status}`,
    template: 'status-update'
  }
};

// Notification types
export const notificationTypes = {
  DEADLINE_7_DAYS: 'deadline_7_days',
  DEADLINE_3_DAYS: 'deadline_3_days', 
  DEADLINE_1_DAY: 'deadline_1_day',
  DEADLINE_TODAY: 'deadline_today',
  DEADLINE_OVERDUE: 'deadline_overdue',
  STATUS_CHANGED: 'status_changed',
  WEEKLY_DIGEST: 'weekly_digest'
} as const;

// User notification preferences interface
export interface UserNotificationPreferences {
  deadlineReminders: boolean;
  deadlineReminderDays: number[];
  overdueNotifications: boolean;
  statusUpdates: boolean;
  weeklyDigest: boolean;
  emailEnabled: boolean;
}

// Submission interface for email functions
export interface EmailSubmission {
  id: string;
  theaterName: string;
  scriptTitle: string;
  submissionDate: string;
  deadline: string;
  status: string;
  notes?: string;
}

// User interface for email functions
export interface EmailUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Debug email sending
export const sendDeadlineReminder = async (submission: any, user: any, daysLeft: number) => {
  console.log('Attempting to send email to:', user.email);
  console.log('Email service configured:', !!process.env.RESEND_API_KEY);
  
  const emailData = {
    from: EMAIL_CONFIG.from,
    to: user.email,
    subject: `Reminder: ${submission.theaterName} response due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: generateDeadlineReminderHTML(submission, daysLeft)
  };
  
  try {
    console.log('Sending email with data:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from
    });
    
    const result = await resend.emails.send(emailData);
    console.log('Email sent successfully:', result);
    
    // Log notification sent
    await logNotification({
      userId: user.id,
      submissionId: submission.id,
      type: `deadline_${daysLeft}_days`,
      sentAt: new Date(),
      emailId: result.id,
      status: 'sent'
    });
    
    return result;
  } catch (error: any) {
    console.error('Failed to send deadline reminder:', error);
    console.error('Error details:', error.response?.body || error.message);
    
    // Log failed notification
    await logNotification({
      userId: user.id,
      submissionId: submission.id,
      type: `deadline_${daysLeft}_days`,
      sentAt: new Date(),
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
};

// Test email function
export const testEmail = async (userEmail: string) => {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: userEmail,
      subject: 'Test Email from Ascend',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #d97706; color: white; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px; margin-bottom: 20px;">
            📝 Ascend
          </div>
          <h1 style="color: #111827;">Test Email</h1>
          <p style="color: #6b7280;">If you receive this, email is working! 🎉</p>
          <p style="color: #6b7280;">Your email service is properly configured.</p>
        </div>
      `
    });
    
    console.log('Test email sent:', result);
    return result;
  } catch (error: any) {
    console.error('Test email failed:', error);
    throw error;
  }
};

// Email validation
export const validateEmailData = (emailData: any) => {
  const errors = [];
  
  if (!emailData.from || !emailData.from.includes('@')) {
    errors.push('Invalid from address');
  }
  
  if (!emailData.to || !emailData.to.includes('@')) {
    errors.push('Invalid to address');
  }
  
  if (!emailData.subject || emailData.subject.length === 0) {
    errors.push('Missing subject');
  }
  
  if (!emailData.html && !emailData.text) {
    errors.push('Missing email content');
  }
  
  return errors;
};

// Log notification to database
const logNotification = async (notificationData: any) => {
  try {
    await prisma.notification.create({
      data: {
        userId: notificationData.userId,
        submissionId: notificationData.submissionId,
        type: notificationData.type,
        sentAt: notificationData.sentAt,
        emailId: notificationData.emailId,
        status: notificationData.status,
      }
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
};

// Professional email templates
export const generateDeadlineReminderHTML = (submission: any, daysLeft: number) => {
  const urgencyColor = daysLeft === 0 ? '#dc2626' : daysLeft <= 3 ? '#d97706' : '#059669';
  const urgencyText = daysLeft === 0 ? 'Due Today!' : 
                     daysLeft === 1 ? 'Due Tomorrow!' : 
                     `${daysLeft} Days Left`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Submission Deadline Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: #d97706; color: white; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px;">
                    📝 Ascend
                </div>
            </div>
            
            <!-- Main Content Card -->
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                <!-- Urgency Badge -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; font-size: 14px;">
                        ⏰ ${urgencyText}
                    </div>
                </div>
                
                <!-- Title -->
                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                    ${submission.theaterName}
                </h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0 0 25px 0; text-align: center;">
                    Response deadline reminder
                </p>
                
                <!-- Submission Details -->
                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 12px 8px 0; font-weight: 600; color: #374151; width: 30%;">Script:</div>
                            <div style="display: table-cell; padding: 8px 0; color: #111827;">${submission.scriptTitle}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 12px 8px 0; font-weight: 600; color: #374151;">Submitted:</div>
                            <div style="display: table-cell; padding: 8px 0; color: #111827;">${new Date(submission.submissionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 12px 8px 0; font-weight: 600; color: #374151;">Deadline:</div>
                            <div style="display: table-cell; padding: 8px 0; color: ${urgencyColor}; font-weight: 600;">${new Date(submission.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        ${submission.fee ? `
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 12px 8px 0; font-weight: 600; color: #374151;">Fee Paid:</div>
                            <div style="display: table-cell; padding: 8px 0; color: #111827;">$${submission.fee}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Action Message -->
                <div style="background: ${daysLeft === 0 ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${daysLeft === 0 ? '#fecaca' : '#fed7aa'}; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                    <p style="margin: 0; color: ${daysLeft === 0 ? '#991b1b' : '#92400e'}; font-size: 14px; line-height: 1.5;">
                        ${daysLeft === 0 ? 
                          '🚨 <strong>Today is the deadline!</strong> Consider following up if you haven\'t heard back yet.' :
                          daysLeft <= 3 ?
                          '⚡ <strong>Deadline approaching soon.</strong> Good time to prepare a polite follow-up email.' :
                          '📅 <strong>Deadline coming up.</strong> Keep this on your radar for potential follow-up.'
                        }
                    </p>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${EMAIL_CONFIG.appUrl}/dashboard?highlight=${submission.id}" 
                       style="background: #d97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                        View in Dashboard →
                    </a>
                </div>
                
                <!-- Quick Actions -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    <p style="margin: 0 0 12px 0; font-weight: 600; color: #374151; font-size: 14px;">Quick Actions:</p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <a href="${EMAIL_CONFIG.appUrl}/dashboard/submission/${submission.id}/edit" 
                           style="background: #f3f4f6; color: #374151; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; border: 1px solid #d1d5db;">
                            ✏️ Update Status
                        </a>
                        <a href="${EMAIL_CONFIG.appUrl}/dashboard/submission/${submission.id}/notes" 
                           style="background: #f3f4f6; color: #374151; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; border: 1px solid #d1d5db;">
                            📝 Add Notes
                        </a>
                        ${submission.contactEmail ? `
                        <a href="mailto:${submission.contactEmail}?subject=Following up on ${submission.scriptTitle} submission" 
                           style="background: #f3f4f6; color: #374151; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; border: 1px solid #d1d5db;">
                            📧 Email Theater
                        </a>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;">
                    You're receiving this because you have deadline reminders enabled.
                </p>
                <p style="margin: 0;">
                    <a href="${EMAIL_CONFIG.appUrl}/settings/notifications" style="color: #d97706; text-decoration: none;">Manage notification preferences</a> | 
                    <a href="${EMAIL_CONFIG.appUrl}/unsubscribe?token={{unsubscribe_token}}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
                </p>
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Ascend - Theater Submission Tracker<br>
                        Built for the SF theater community
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const generateStatusUpdateHTML = (submission: any, oldStatus: string, newStatus: string) => {
  const statusConfig: any = {
    accepted: { color: '#059669', emoji: '🎉', message: 'Congratulations!' },
    rejected: { color: '#dc2626', emoji: '📝', message: 'Keep writing!' },
    no_response: { color: '#d97706', emoji: '⏰', message: 'Time to follow up' }
  };
  
  const config = statusConfig[newStatus] || { color: '#6b7280', emoji: '📋', message: 'Status updated' };
  
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">${config.emoji}</div>
                    <h1 style="color: ${config.color}; font-size: 28px; margin: 0;">${config.message}</h1>
                </div>
                
                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h2 style="margin: 0 0 12px 0; color: #111827;">${submission.theaterName}</h2>
                    <p style="margin: 0 0 8px 0; color: #6b7280;"><strong>Script:</strong> ${submission.scriptTitle}</p>
                    <p style="margin: 0; color: #6b7280;">
                        <strong>Status:</strong> 
                        <span style="text-decoration: line-through; color: #9ca3af;">${oldStatus}</span> → 
                        <span style="color: ${config.color}; font-weight: 600;">${newStatus}</span>
                    </p>
                </div>
                
                ${newStatus === 'accepted' ? `
                <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                    <p style="margin: 0; color: #065f46;">
                        🎊 <strong>Amazing news!</strong> Your script has been accepted. Time to celebrate and prepare for the next steps!
                    </p>
                </div>
                ` : newStatus === 'rejected' ? `
                <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                    <p style="margin: 0; color: #991b1b;">
                        💪 <strong>Keep going!</strong> Every "no" gets you closer to the right "yes". Your next opportunity is waiting.
                    </p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <a href="${EMAIL_CONFIG.appUrl}/dashboard" 
                       style="background: #d97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                        View Dashboard →
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send status update email
export const sendStatusUpdateEmail = async (submission: any, user: any, oldStatus: string, newStatus: string) => {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: user.email,
      subject: `Status Update: ${submission.theaterName} - ${newStatus}`,
      html: generateStatusUpdateHTML(submission, oldStatus, newStatus)
    });

    await logNotification({
      userId: user.id,
      submissionId: submission.id,
      type: `status_update_${newStatus}`,
      sentAt: new Date(),
      emailId: result.id,
      status: 'sent'
    });

    return result;
  } catch (error: any) {
    console.error('Failed to send status update email:', error);
    throw error;
  }
};

// Generate weekly digest HTML
const generateWeeklyDigestHTML = (
  upcomingDeadlines: EmailSubmission[], 
  overdueResponses: EmailSubmission[], 
  appUrl: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 16px;">Your Weekly Submission Summary</h2>
        
        ${upcomingDeadlines.length > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #059669;">Upcoming Deadlines (Next 7 Days)</h3>
            ${upcomingDeadlines.map(sub => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;">
                <strong>${sub.theaterName}</strong> - ${sub.scriptTitle}<br>
                <small style="color: #6b7280;">
                  Due: ${new Date(sub.deadline).toLocaleDateString()} 
                  (${Math.ceil((new Date(sub.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days)
                </small>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${overdueResponses.length > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #dc2626;">Overdue Responses</h3>
            ${overdueResponses.map(sub => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;">
                <strong>${sub.theaterName}</strong> - ${sub.scriptTitle}<br>
                <small style="color: #6b7280;">
                  Deadline passed: ${new Date(sub.deadline).toLocaleDateString()}
                </small>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="margin-top: 20px;">
          <a href="${appUrl}/dashboard" 
             style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Submissions
          </a>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>Don't want weekly digests? <a href="${appUrl}/settings/notifications">Manage your notification preferences</a></p>
        </div>
      </div>
    </div>
  `;
};

// Send weekly digest email
export const sendWeeklyDigest = async (
  user: EmailUser, 
  submissions: EmailSubmission[]
) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const upcomingDeadlines = submissions.filter(sub => {
    const deadline = new Date(sub.deadline);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return deadline <= nextWeek && deadline >= new Date();
  });
  
  const overdueResponses = submissions.filter(sub => {
    const deadline = new Date(sub.deadline);
    return deadline < new Date() && sub.status === 'Submitted';
  });
  
  if (upcomingDeadlines.length === 0 && overdueResponses.length === 0) {
    return; // No digest needed
  }
  
  const emailData = {
    from: 'TheaterMap <notifications@theatermap.com>',
    to: user.email,
    subject: 'Your Weekly Submission Summary',
    html: generateWeeklyDigestHTML(upcomingDeadlines, overdueResponses, appUrl),
  };
  
  try {
    const result = await resend.emails.send(emailData);
    
    console.log('Weekly digest sent:', {
      userId: user.id,
      type: 'weekly_digest',
      sentAt: new Date(),
      emailId: result.data?.id
    });
    
    return result;
  } catch (error) {
    console.error('Failed to send weekly digest:', error);
    throw error;
  }
}; 