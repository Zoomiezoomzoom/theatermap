import cron from 'node-cron';
import { checkUpcomingDeadlines, sendWeeklyDigests } from './notifications';

// Initialize cron jobs
export const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  
  // Check deadlines daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily deadline check...');
    try {
      await checkUpcomingDeadlines();
      console.log('Daily deadline check completed');
    } catch (error) {
      console.error('Error in daily deadline check:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Los_Angeles" // Pacific Time
  });
  
  // Send weekly digests on Sundays at 8 AM
  cron.schedule('0 8 * * 0', async () => {
    console.log('Running weekly digest...');
    try {
      await sendWeeklyDigests();
      console.log('Weekly digest completed');
    } catch (error) {
      console.error('Error in weekly digest:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Los_Angeles" // Pacific Time
  });
  
  console.log('Cron jobs initialized');
};

// Manual trigger functions for testing
export const triggerDeadlineCheck = async () => {
  console.log('Manually triggering deadline check...');
  try {
    await checkUpcomingDeadlines();
    console.log('Manual deadline check completed');
  } catch (error) {
    console.error('Error in manual deadline check:', error);
    throw error;
  }
};

export const triggerWeeklyDigest = async () => {
  console.log('Manually triggering weekly digest...');
  try {
    await sendWeeklyDigests();
    console.log('Manual weekly digest completed');
  } catch (error) {
    console.error('Error in manual weekly digest:', error);
    throw error;
  }
}; 