import { Link, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, MapPin } from 'lucide-react';

import SaveJobButton from '@/components/save-job-button';

const JobCard = ({ job }) => {
  const location = useLocation();
  const navigationState = { from: `${location.pathname}${location.search}` };
  return (
  <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-ring">
    <div className="mb-5 flex items-center gap-3">
      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-sm font-bold">{job.initials}</span>
      <div className="min-w-0"><p className="font-medium">{job.company}</p><p className="text-sm text-muted-foreground">{job.mode}</p></div>
      <SaveJobButton job={job} />
    </div>
    <h3 className="mb-2 text-xl font-semibold tracking-tight"><Link to={`/job/${job.id}`} state={navigationState} className="rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{job.title}</Link></h3>
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-4" />{job.location}</span>
      <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness aria-hidden="true" className="size-4" />{job.type}</span>
    </div>
    <p className="my-4 text-sm leading-6 text-muted-foreground">{job.description}</p>
    <ul aria-label="Skills" className="mb-6 flex flex-wrap gap-2">{job.tags.map((tag) => <li key={tag} className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">{tag}</li>)}</ul>
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="font-semibold">{job.salary}<span className="block text-sm font-normal text-muted-foreground">{job.experience} experience</span></p>
      <Link to={`/job/${job.id}`} state={navigationState} aria-label={`View ${job.title} at ${job.company}`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View job</Link>
    </div>
  </article>
  );
};
export default JobCard;
