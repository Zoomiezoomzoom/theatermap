import { initializeCronJobs } from './cron';

// Initialize cron jobs when the app starts
// This should be called once when the server starts
let cronInitialized = false;

export const initCronJobs = () => {
  if (cronInitialized) {
    console.log('Cron jobs already initialized');
    return;
  }

  // Only initialize in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    console.log('Initializing cron jobs...');
    initializeCronJobs();
    cronInitialized = true;
  } else {
    console.log('Cron jobs disabled in development mode. Set ENABLE_CRON=true to enable.');
  }
};

// Export for manual initialization
export { triggerDeadlineCheck, triggerWeeklyDigest } from './cron'; 