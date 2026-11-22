import { Link, useLocation } from 'react-router-dom';
import { Check, MapPin, Trash2 } from 'lucide-react';

const SavedJobCard = ({ job, applied, onApply, onRemove }) => {
  const location = useLocation();
  return (
    <article aria-labelledby={`saved-${job.id}`} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold">{job.initials}</span>
        <div className="min-w-0 flex-1"><p className="font-medium">{job.company}</p><p className="text-sm text-muted-foreground">{job.mode}</p></div>
        <button type="button" onClick={onRemove} aria-label={`Remove ${job.title} at ${job.company} from saved jobs`} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Trash2 aria-hidden="true" className="size-4" /></button>
      </div>
      <h2 id={`saved-${job.id}`} className="text-xl font-semibold tracking-tight"><Link to={`/job/${job.id}`} state={{ from: `${location.pathname}${location.search}` }} className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-ring">{job.title}</Link></h2>
      <p className="mb-4 mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="size-4 shrink-0" />{job.location}</p>
      <p className="mb-5 text-sm leading-6 text-muted-foreground">{job.companyDescription}</p>
      <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
        <div><dt className="text-muted-foreground">Annual salary</dt><dd className="mt-1 font-semibold">{job.salary}</dd></div>
        <div><dt className="text-muted-foreground">Experience</dt><dd className="mt-1 font-medium">{job.experience}</dd></div>
        <div><dt className="text-muted-foreground">Job type</dt><dd className="mt-1 font-medium">{job.type}</dd></div>
        <div><dt className="text-muted-foreground">Posted</dt><dd className="mt-1 font-medium"><time dateTime={job.postedAt}>{new Date(`${job.postedAt}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></dd></div>
      </dl>
      <ul aria-label="Skills" className="my-5 flex flex-wrap gap-2">{job.tags.map((tag) => <li key={tag} className="rounded-md bg-secondary px-2.5 py-1 text-sm">{tag}</li>)}</ul>
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <Link to={`/job/${job.id}`} state={{ from: `${location.pathname}${location.search}` }} aria-label={`View details for ${job.title} at ${job.company}`} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View Details</Link>
        <button type="button" disabled={applied} onClick={onApply} aria-label={applied ? `Applied locally to ${job.title}` : `Apply now to ${job.title} at ${job.company}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70">{applied && <Check aria-hidden="true" className="size-4" />}{applied ? 'Applied locally' : 'Apply Now'}</button>
      </div>
    </article>
  );
};
export default SavedJobCard;
