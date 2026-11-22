import { getRecommendations } from './recommendations.js';
import { jobs } from '../data/jobs.js';
import { applicationStatuses, getApplications } from './application-tracker.js';

export function getDashboardData(actions, now = new Date(), profile) {
  const applications = getApplications(actions);
  const savedJobs = jobs.filter((job) => actions.saved.includes(job.id));
  const counts = Object.fromEntries(applicationStatuses.map((status) => [status, applications.filter((job) => job.application.status === status).length]));
  const recommendations = getRecommendations(profile, actions, { now });
  const trend = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return {
      key: start.toISOString().slice(0, 7),
      label: start.toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      count: applications.filter(({ application }) => application.appliedAt && new Date(application.appliedAt) >= start && new Date(application.appliedAt) < end && new Date(application.appliedAt) <= now).length,
    };
  });
  return { savedJobs, applications, counts, recent: applications.slice(0, 4), recommendations, trend };
}
