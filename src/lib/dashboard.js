import { jobs } from '../data/jobs.js';
import { applicationStatuses, getApplications } from './application-tracker.js';

export function getDashboardData(actions, now = new Date()) {
  const applications = getApplications(actions);
  const savedJobs = jobs.filter((job) => actions.saved.includes(job.id));
  const counts = Object.fromEntries(applicationStatuses.map((status) => [status, applications.filter((job) => job.application.status === status).length]));
  const interests = [...savedJobs, ...applications];
  const recommendations = jobs.filter((job) => !actions.applied.includes(job.id)).map((job) => {
    const sharedSkills = job.tags.filter((tag) => interests.some((interest) => interest.tags.includes(tag)));
    const sameLocation = interests.some((interest) => interest.location === job.location);
    return { job, score: sharedSkills.length * 3 + Number(sameLocation), reason: sharedSkills.length ? `Matches your interest in ${sharedSkills.join(', ')}` : sameLocation ? `Based on your interest in ${job.location}` : 'Explore a new opportunity' };
  }).sort((a, b) => b.score - a.score || b.job.postedAt.localeCompare(a.job.postedAt) || a.job.id.localeCompare(b.job.id)).slice(0, 3);
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
