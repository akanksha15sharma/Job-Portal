import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, ChevronDown, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import SavedJobCard from '@/components/saved-job-card';
import { useJobActions } from '@/hooks/use-job-actions';
import { jobs, locations } from '@/data/jobs';
import { jobTypes, readJobFilters, sortOptions } from '@/lib/job-filters';
import { getSavedJobResults } from '@/lib/saved-jobs';

const controlClass = 'h-12 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-9 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring';
const SavedJobs = () => {
  const { saved, applied, perform, error } = useJobActions();
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const dialogRef = useRef(null);
  const resultRef = useRef(null);
  const filters = readJobFilters(params);
  const total = jobs.filter((job) => saved.includes(job.id)).length;
  const results = getSavedJobResults(saved, params);
  const update = (key, value, replace = false) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace });
  };
  const chips = [
    { key: 'q', value: filters.query, label: `Search: ${filters.query}` },
    { key: 'location', value: filters.location, label: filters.location },
    { key: 'type', value: filters.type, label: filters.type },
  ].filter(({ value }) => value);
  const controls = [
    { key: 'location', label: 'Location', placeholder: 'All locations', options: locations.map((value) => ({ value, label: value })) },
    { key: 'type', label: 'Job type', placeholder: 'All job types', options: jobTypes.map((value) => ({ value, label: value })) },
    { key: 'sort', label: 'Sort by', options: sortOptions },
  ];
  const removeJob = (job) => {
    if (perform('remove-saved', job.id)) {
      setMessage(`${job.title} at ${job.company} removed from saved jobs.`);
      resultRef.current?.focus();
    }
  };
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="saved-heading">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div><p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Bookmark aria-hidden="true" className="size-4" />Your career shortlist</p><h1 id="saved-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Saved jobs <span className="text-muted-foreground">({total})</span></h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Good opportunities deserve a second look. Compare your favorites and take your next step.</p></div>
        <button type="button" disabled={!total} onClick={() => dialogRef.current?.showModal()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"><Trash2 aria-hidden="true" className="size-4" />Clear all saved jobs</button>
      </div>
      <p className="mb-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-6 text-muted-foreground">Saved jobs and demo applications are stored in this browser. Apply Now records a local demo application; nothing is sent to an employer.</p>
      {total > 0 && <section aria-labelledby="saved-filters-heading" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="saved-filters-heading" className="flex items-center gap-2 font-semibold"><SlidersHorizontal aria-hidden="true" className="size-4" />Find a saved opportunity</h2><button type="button" disabled={!params.size} onClick={() => setParams({})} className="min-h-10 rounded-lg px-3 text-sm underline underline-offset-4 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Clear filters</button></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div><label htmlFor="saved-keyword" className="mb-2 block text-sm font-medium">Keyword</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-4 size-4 text-muted-foreground" /><input id="saved-keyword" type="search" value={filters.query} onChange={(event) => update('q', event.target.value, true)} placeholder="Title, company, or skill" className={controlClass.replace('pl-3', 'pl-10')} /></div></div>
          {controls.map(({ key, label, placeholder, options }) => <div key={key}><label htmlFor={`saved-${key}`} className="mb-2 block text-sm font-medium">{label}</label><div className="relative"><select id={`saved-${key}`} value={filters[key]} onChange={(event) => update(key, event.target.value)} className={controlClass}>{placeholder && <option value="">{placeholder}</option>}{options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-4 size-4 text-muted-foreground" /></div></div>)}
        </div><p className="mt-4 text-sm text-muted-foreground">Newest sorts by posting date. Salary sorts by the highest advertised annual pay (LPA).</p>
      </section>}
      {total > 0 && chips.length > 0 && <div aria-label="Active saved job filters" className="mt-5 flex flex-wrap gap-2">{chips.map(({ key, label }) => <button key={key} type="button" onClick={() => update(key, '')} aria-label={`Remove filter: ${label}`} className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"><span className="truncate">{label}</span><X aria-hidden="true" className="size-4 shrink-0" /></button>)}</div>}
      <p role="status" aria-atomic="true" className="mt-5 text-sm text-muted-foreground">{message}</p>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <h2 ref={resultRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="my-6 rounded text-base font-medium focus-visible:ring-2 focus-visible:ring-ring">Showing {results.length} of {total} saved {total === 1 ? 'job' : 'jobs'}</h2>
      {results.length > 0 ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{results.map((job) => <SavedJobCard key={job.id} job={job} applied={applied.includes(job.id)} onRemove={() => removeJob(job)} onApply={() => { if (perform('apply', job.id)) setMessage(`Demo application for ${job.title} recorded. View it in My Jobs.`); }} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center"><Bookmark aria-hidden="true" className="mx-auto mb-5 size-10 text-muted-foreground" /><h2 className="text-2xl font-semibold">{total ? 'No saved jobs match your search' : 'Your next opportunity starts here'}</h2><p className="mx-auto mb-6 mt-3 max-w-md leading-7 text-muted-foreground">{total ? 'Try another keyword or remove a filter. Your saved jobs are still in your shortlist.' : 'Tap the bookmark on any job to build your shortlist. Your favorites will be waiting here.'}</p>{total ? <button type="button" onClick={() => setParams({})} className="min-h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground">Clear filters</button> : <Link to="/jobs" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground">Explore jobs</Link>}</div>}
      <dialog ref={dialogRef} aria-labelledby="clear-saved-title" aria-describedby="clear-saved-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl backdrop:bg-black/60">
        <h2 id="clear-saved-title" className="text-xl font-semibold">Clear all saved jobs?</h2><p id="clear-saved-description" className="my-4 leading-7 text-muted-foreground">This removes every saved job, including jobs hidden by your filters. Your demo applications will stay in My Jobs. You can save jobs again later.</p>
        <form method="dialog" className="flex flex-wrap justify-end gap-3"><button autoFocus className="min-h-11 rounded-lg border border-border px-4 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">Cancel</button><button type="button" onClick={() => { if (perform('clear-saved')) { dialogRef.current?.close(); setMessage('All saved jobs cleared. Your applications are unchanged.'); resultRef.current?.focus(); } }} className="min-h-11 rounded-lg bg-primary px-4 font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">Clear all jobs</button></form>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </dialog>
    </section>
  );
};
export default SavedJobs;
