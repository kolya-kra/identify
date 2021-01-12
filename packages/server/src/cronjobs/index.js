import { CronJob } from 'cron';
import VisitRemover from './oldVisits';
import FirestoreCleanup from './firebaseCleanup';
import UsedVerificationCodes from './usedVerificationCodes';
import StatsCreator from './stats';

const cronjobs = [
  {
    schedule: '30 2 * * *',
    action: VisitRemover,
    description: 'Visit Remover',
  },
  {
    schedule: '0 3 * * *',
    action: FirestoreCleanup,
    description: 'Firestore Cleaner',
  },
  {
    schedule: '30 3 * * *',
    action: UsedVerificationCodes,
    description: 'Used Codes Remover',
  },
  {
    schedule: '0 4 * * *',
    action: StatsCreator,
    description: 'Stats Creator',
  },
];

let activeJobs;

export const startJobs = () => {
  activeJobs = cronjobs.map((cronjob) => {
    const job = new CronJob(cronjob.schedule, cronjob.action);
    console.log(`Scheduled Job successfully: ${cronjob.description}`);
    job.start();
    return job;
  });
};

export const runJobsOnce = () => {
  cronjobs.forEach((job) => {
    job.action();
    console.log(`Run Job successfully: ${job.description}`);
  });
};

export const stopJobs = () => {
  activeJobs.forEach((job) => {
    job.stop();
  });
};
