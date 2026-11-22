import { Link } from 'react-router-dom';
import JobCard from '@/components/job-card';
import { jobs } from '@/data/jobs';
import { useJobActions } from '@/hooks/use-job-actions';

const JobCollection = ({ kind }) => {
  const { saved, applied, perform, error } = useJobActions();
  const isSaved = kind === 'saved';
  const items = jobs.filter((job) => (isSaved ? saved : applied).includes(job.id));
  return <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold tracking-tight">{isSaved ? 'Saved jobs' : 'My applications'}</h1>
    <p className="mb-8 mt-3 text-muted-foreground">{isSaved ? 'Your shortlist, ready when you are.' : 'Demo applications recorded on this device. Nothing has been sent to employers.'} Stored locally in this browser.</p>
    <p role="status" className="mb-5 text-sm text-muted-foreground">{items.length} {isSaved ? 'saved jobs' : 'demo applications'}</p>
    {error && <p role="alert" className="mb-5 text-destructive">{error}</p>}
    {items.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((job) => <div key={job.id} className="flex flex-col gap-3"><JobCard job={job} />{isSaved && <button type="button" onClick={() => perform('save', job.id)} aria-label={`Remove ${job.title} at ${job.company} from saved jobs`} className="min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">Remove saved job</button>}</div>)}</div> : <div className="rounded-2xl border border-dashed border-border p-8 text-center"><h2 className="text-xl font-semibold">{isSaved ? 'Build your shortlist' : 'No applications yet'}</h2><p className="my-4 text-muted-foreground">{isSaved ? 'Save a job from its details page to find it here.' : 'Open a job and choose Apply Now to record a demo application.'}</p><Link to="/jobs" className="inline-block rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground">Browse jobs</Link></div>}
  </section>;
};
export default JobCollection;
