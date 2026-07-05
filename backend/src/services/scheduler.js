import cron from 'node-cron';
import { expireOldJobs } from './jobService.js';

export const startSchedulers = () => {
  cron.schedule('0 * * * *', async () => {
    const count = await expireOldJobs();
    if (count) console.log(`Expired ${count} jobs`);
  });
};
