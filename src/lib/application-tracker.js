import { jobs } from '../data/jobs.js';
export const applicationStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];

export function getApplications(actions, params = new URLSearchParams()) {
  const query = (params.get('q') || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return jobs.filter((job) => actions.applied.includes(job.id)).map((job) => ({
    ...job,
    application: actions.applications?.[job.id] || { status: 'Applied', notes: '', appliedAt: null, updatedAt: null },
  })).filter((job) => {
    const text = [job.title, job.company, ...job.tags].join(' ').toLowerCase();
    return query.every((term) => text.includes(term))
      && (!params.get('status') || !applicationStatuses.includes(params.get('status')) || job.application.status === params.get('status'))
      && (!params.get('location') || job.location === params.get('location'));
  }).sort((a, b) => {
    const sort = params.get('sort');
    if (sort === 'company') return a.company.localeCompare(b.company) || a.id.localeCompare(b.id);
    if (sort === 'salary') return b.salaryMax - a.salaryMax || a.id.localeCompare(b.id);
    const date = (job) => job.application[sort === 'updated' ? 'updatedAt' : 'appliedAt'] || '';
    if (sort === 'oldest') return date(a).localeCompare(date(b)) || a.id.localeCompare(b.id);
    return date(b).localeCompare(date(a)) || a.id.localeCompare(b.id);
  });
}
