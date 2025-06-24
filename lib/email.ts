import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Generate deadline reminder email HTML
const generateDeadlineReminderHTML = (submission: EmailSubmission, daysLeft: number, appUrl: string) => {
  const userName = submission.theaterName; // Could be enhanced with actual user name
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 16px;">
          ${submission.theaterName} Response Due Soon
        </h2>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #d97706;">
            ${daysLeft === 0 ? 'Due Today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Theater:</td>
              <td style="padding: 8px 0;">${submission.theaterName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Script:</td>
              <td style="padding: 8px 0;">${submission.scriptTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px 0;">${new Date(submission.submissionDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Deadline:</td>
              <td style="padding: 8px 0;">${new Date(submission.deadline).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        ${daysLeft === 0 ? 
          '<p style="color: #dc2626; font-weight: bold;">This deadline is today! Consider following up if you haven\'t heard back.</p>' :
          '<p>You might want to prepare a follow-up email or check if they have any updates.</p>'
        }
        
        <div style="margin-top: 20px;">
          <a href="${appUrl}/dashboard" 
             style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Dashboard
          </a>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>Don't want these reminders? <a href="${appUrl}/settings/notifications">Manage your notification preferences</a></p>
        </div>
      </div>
    </div>
  `;
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

// Send deadline reminder email
export const sendDeadlineReminder = async (
  submission: EmailSubmission, 
  user: EmailUser, 
  daysLeft: number
) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const emailData = {
    from: 'TheaterMap <notifications@theatermap.com>',
    to: user.email,
    subject: `Reminder: ${submission.theaterName} response due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: generateDeadlineReminderHTML(submission, daysLeft, appUrl),
  };
  
  try {
    const result = await resend.emails.send(emailData);
    
    // Log notification sent (you can implement this with your database)
    console.log('Deadline reminder sent:', {
      userId: user.id,
      submissionId: submission.id,
      type: `deadline_${daysLeft}_days`,
      sentAt: new Date(),
      emailId: result.data?.id
    });
    
    return result;
  } catch (error) {
    console.error('Failed to send deadline reminder:', error);
    throw error;
  }
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

// Send status update email
export const sendStatusUpdate = async (
  submission: EmailSubmission, 
  user: EmailUser, 
  oldStatus: string, 
  newStatus: string
) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const emailData = {
    from: 'TheaterMap <notifications@theatermap.com>',
    to: user.email,
    subject: `Submission update: ${submission.theaterName} - ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">Submission Status Updated</h2>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #059669;">${submission.theaterName}</h3>
            
            <p><strong>Script:</strong> ${submission.scriptTitle}</p>
            <p><strong>Status changed from:</strong> ${oldStatus} → <strong>${newStatus}</strong></p>
            
            ${submission.notes ? `<p><strong>Notes:</strong> ${submission.notes}</p>` : ''}
          </div>
          
          <div style="margin-top: 20px;">
            <a href="${appUrl}/dashboard" 
               style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };
  
  try {
    const result = await resend.emails.send(emailData);
    
    console.log('Status update sent:', {
      userId: user.id,
      submissionId: submission.id,
      type: 'status_changed',
      oldStatus,
      newStatus,
      sentAt: new Date(),
      emailId: result.data?.id
    });
    
    return result;
  } catch (error) {
    console.error('Failed to send status update:', error);
    throw error;
  }
}; 