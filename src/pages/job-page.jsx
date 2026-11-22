import { Link, useLocation, useParams } from 'react-router-dom';
import { Bookmark, Check, Building2, BriefcaseBusiness, MapPin, Wallet, GraduationCap } from 'lucide-react';
import { jobs } from '@/data/jobs';
import { useJobActions } from '@/hooks/use-job-actions';

const buttonClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default';

const JobPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const previous = typeof state?.from === 'string' ? state.from : '';
  const returnTo = previous === '/' ? '/' : /^\/(jobs|saved-jobs|my-jobs|dashboard|notifications)(\?|$)/.test(previous) ? previous : '/jobs';
  const { saved, applied, perform, error } = useJobActions();
  const job = jobs.find((item) => item.id === id);
  if (!job) return <section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-3xl font-semibold">Job not found</h1><p className="my-4 text-muted-foreground">This listing is not available. Explore the other sample opportunities.</p><Link to="/jobs" className="underline underline-offset-4">Browse jobs</Link></section>;
  const isSaved = saved.includes(id);
  const isApplied = applied.includes(id);
  const facts = [
    { icon: Wallet, label: 'Annual salary', value: job.salary },
    { icon: MapPin, label: 'Location', value: `${job.location} · ${job.mode}` },
    { icon: GraduationCap, label: 'Experience', value: `${job.experience} · ${job.experienceLevel === 'mid' ? 'Mid-level' : job.experienceLevel}` },
    { icon: BriefcaseBusiness, label: 'Job type', value: job.type },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="job-heading">
      <Link to={returnTo} className="mb-6 inline-block rounded text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{returnTo === '/' || returnTo === '/dashboard' ? 'Back to recommendations' : 'Back to results'}</Link>
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl font-bold">{job.initials}</span>
          <div><p className="mb-2 text-sm text-muted-foreground">{job.company} · Sample opportunity</p><h1 id="job-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h1><p className="mt-3 text-sm text-muted-foreground">Posted <time dateTime={job.postedAt}>{new Date(`${job.postedAt}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></p></div>
        </div>
        <dl className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">{facts.map(({ icon: Icon, label, value }) => <div key={label}><dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><Icon aria-hidden="true" className="size-4" />{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
      </div>
      <nav aria-label="Job details sections" className="mb-7 flex flex-wrap gap-2 border-b border-border pb-5">
        {[['overview', 'Overview'], ['responsibilities', 'Responsibilities'], ['requirements', 'Requirements'], ['benefits', 'Benefits'], ['company', 'Company']].map(([anchor, label]) => <a key={anchor} href={`#${anchor}`} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{label}</a>)}
      </nav>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="order-2 min-w-0 space-y-9 lg:order-1 rounded-2xl border border-border bg-card p-6 sm:p-9">
          <section id="overview" className="scroll-mt-6"><h2 className="mb-3 text-xl font-semibold">About the role</h2><p className="leading-7 text-muted-foreground">{job.description}</p></section>
          {[['What you’ll do', job.responsibilities, 'responsibilities'], ['Requirements', job.requirements, 'requirements'], ['Benefits', job.benefits, 'benefits']].map(([title, items, anchor]) => <section key={title} id={anchor} className="scroll-mt-6"><h2 className="mb-3 text-xl font-semibold">{title}</h2><ul className="list-disc space-y-3 pl-5 leading-7 text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}
          <section><h2 className="mb-3 text-xl font-semibold">Skills</h2><ul className="flex flex-wrap gap-2">{job.tags.map((tag) => <li key={tag} className="rounded-md bg-secondary px-3 py-1.5 text-sm">{tag}</li>)}</ul></section>
        </article>
        <aside className="order-1 space-y-6 lg:order-2 lg:sticky lg:top-6" aria-label="Job actions and company">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Your next step</h2><p className="mb-5 mt-3 text-sm leading-6 text-muted-foreground">Demo listing: Apply Now records your interest on this device. No application is sent to an employer.</p>
            <div className="flex flex-col gap-3">
              <button type="button" disabled={isApplied} onClick={() => perform('apply', id)} className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/80`}>{isApplied && <Check aria-hidden="true" className="size-4" />}{isApplied ? 'Applied locally' : 'Apply Now'}</button>
              <button type="button" aria-pressed={isSaved} onClick={() => perform('save', id)} className={`${buttonClass} border border-border hover:bg-accent`}><Bookmark aria-hidden="true" className={`size-4 ${isSaved ? 'fill-current' : ''}`} />{isSaved ? 'Saved · Unsave job' : 'Save Job'}</button>
            </div>
            <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{isApplied ? 'Demo application recorded. You can review it in My Jobs.' : isSaved ? 'Saved to your jobs on this device.' : ''}</p>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link to="/saved-jobs" className="underline underline-offset-4">Saved jobs</Link><Link to="/my-jobs" className="underline underline-offset-4">My applications</Link></div>
          </div>
          <section id="company" className="scroll-mt-6 rounded-2xl border border-border bg-card p-6"><Building2 aria-hidden="true" className="mb-4 size-6 text-muted-foreground" /><h2 className="text-xl font-semibold">About {job.company}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{job.companyDescription}</p><p className="mt-4 text-sm text-muted-foreground">Fictional company · Illustrative benefits and requirements</p></section>
        </aside>
      </div>
    </section>
  );
};
export default JobPage;
