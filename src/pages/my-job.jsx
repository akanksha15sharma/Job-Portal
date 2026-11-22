import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BriefcaseBusiness, Search } from 'lucide-react';
import ApplicationCard from '@/components/application-card';
import { applicationStatuses, getApplications } from '@/lib/application-tracker';
import { locations } from '@/data/jobs';
import { useJobActions } from '@/hooks/use-job-actions';

const control = 'min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const MyJobs = () => {
  const actions = useJobActions();
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const removeRef = useRef(null);
  const notesRef = useRef(null);
  const resultRef = useRef(null);
  const all = getApplications(actions);
  const results = getApplications(actions, params);
  const updateParam = (key, value, replace = false) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value); else next.delete(key);
    return next;
  }, { replace });
  const counts = Object.fromEntries(applicationStatuses.map((status) => [status, all.filter((job) => job.application.status === status).length]));
  const update = (job, details) => {
    if (!actions.perform('update-application', job.id, details)) return false;
    setMessage(`${job.title}: ${details.status ? `status updated to ${details.status}` : 'notes saved'}.`);
    resultRef.current?.focus();
    return true;
  };
  return <section aria-labelledby="tracker-heading" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
    <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><BriefcaseBusiness aria-hidden="true" className="size-4" />Your career, in progress</p><h1 id="tracker-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Application tracker</h1><p className="mb-7 mt-3 max-w-2xl leading-7 text-muted-foreground">Keep every opportunity, interview, and next step in one place. Demo applications are stored in this browser; no information is sent to employers.</p>
    <div aria-label="Application counts" className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{['All applications', ...applicationStatuses].map((status) => <button key={status} type="button" aria-pressed={(params.get('status') || 'All applications') === status} onClick={() => updateParam('status', status === 'All applications' ? '' : status)} className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent aria-pressed:border-ring aria-pressed:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"><span className="block text-2xl font-semibold">{status === 'All applications' ? all.length : counts[status]}</span><span className="mt-1 block text-sm text-muted-foreground">{status}</span></button>)}</div>
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Find an application</h2><button type="button" disabled={!params.size} onClick={() => setParams({})} className="min-h-10 rounded-lg px-3 text-sm underline underline-offset-4 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Clear filters</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><label htmlFor="application-search" className="mb-2 block text-sm font-medium">Search applications</label><input id="application-search" type="search" placeholder="Job, company, or skill" value={params.get('q') || ''} onChange={(event) => updateParam('q', event.target.value, true)} className={control} /></div>{[
      { key: 'status', label: 'Status', options: [['', 'All statuses'], ...applicationStatuses.map((status) => [status, status])] },
      { key: 'location', label: 'Location', options: [['', 'All locations'], ...locations.map((value) => [value, value])] },
      { key: 'sort', label: 'Sort by', options: [['', 'Applied: newest first'], ['oldest', 'Applied: oldest first'], ['updated', 'Recently updated'], ['company', 'Company: A–Z'], ['salary', 'Salary: high to low']] },
    ].map(({ key, label, options }) => <div key={key}><label htmlFor={`application-${key}`} className="mb-2 block text-sm font-medium">{label}</label><select id={`application-${key}`} value={options.some(([value]) => value === params.get(key)) ? params.get(key) : ''} onChange={(event) => updateParam(key, event.target.value)} className={control}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div>)}</div></div>
    <p role="status" aria-atomic="true" className="mt-5 text-sm text-muted-foreground">{message}</p>{actions.error && <p role="alert" className="mt-4 text-destructive">{actions.error}</p>}<h2 ref={resultRef} tabIndex={-1} aria-live="polite" className="my-6 rounded font-medium focus-visible:ring-2 focus-visible:ring-ring">Showing {results.length} of {all.length} applications</h2>
    {results.length ? <div className="grid items-start gap-5 lg:grid-cols-2">{results.map((job) => <ApplicationCard key={job.id} job={job} onUpdate={(status) => update(job, { status })} onRemove={() => { setSelected(job); removeRef.current?.showModal(); }} onNotes={() => { setSelected(job); setNotes(job.application.notes); notesRef.current?.showModal(); }} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center"><Search aria-hidden="true" className="mx-auto mb-5 size-9 text-muted-foreground" /><h2 className="text-2xl font-semibold">{all.length ? 'No matching applications' : 'Your next chapter starts with one application'}</h2><p className="my-4 text-muted-foreground">{all.length ? 'Try a different keyword, status, or location.' : 'Browse jobs and choose Apply Now to begin tracking your demo applications.'}</p>{all.length ? <button onClick={() => setParams({})} className="min-h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground">Clear filters</button> : <Link to="/jobs" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground">Browse jobs</Link>}</div>}
    <dialog ref={removeRef} aria-labelledby="remove-application-title" aria-describedby="remove-application-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl backdrop:bg-black/60"><h2 id="remove-application-title" className="text-xl font-semibold">Remove application?</h2><p id="remove-application-description" className="my-4 leading-7 text-muted-foreground">Remove {selected?.title} at {selected?.company}, including its notes and tracking history? Saved jobs are kept. You can apply again later.</p><form method="dialog" className="flex flex-wrap justify-end gap-3"><button autoFocus className="min-h-11 rounded-lg border border-border px-4">Cancel</button><button type="button" onClick={() => { if (selected && actions.perform('remove-application', selected.id)) { removeRef.current?.close(); setMessage('Application removed. Your saved jobs are unchanged.'); resultRef.current?.focus(); } }} className="min-h-11 rounded-lg bg-primary px-4 font-medium text-primary-foreground">Remove application</button></form>{actions.error && <p role="alert" className="mt-3 text-destructive">{actions.error}</p>}</dialog>
    <dialog ref={notesRef} aria-labelledby="application-notes-title" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl backdrop:bg-black/60"><h2 id="application-notes-title" className="text-xl font-semibold">Notes for {selected?.title}</h2><form onSubmit={(event) => { event.preventDefault(); if (selected && update(selected, { notes })) { notesRef.current?.close(); resultRef.current?.focus(); } }}><label htmlFor="application-notes" className="mb-2 mt-5 block text-sm font-medium">Interview reminders and next steps</label><textarea autoFocus id="application-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} rows={7} aria-describedby="notes-limit" className={`${control} resize-y py-3`} /><p id="notes-limit" className="my-3 text-sm text-muted-foreground">{notes.length}/5000 characters · Saved only when you choose Save notes.</p><div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => notesRef.current?.close()} className="min-h-11 rounded-lg border border-border px-4">Cancel</button><button className="min-h-11 rounded-lg bg-primary px-4 font-medium text-primary-foreground">Save notes</button></div></form>{actions.error && <p role="alert" className="mt-3 text-destructive">{actions.error}</p>}</dialog>
  </section>;
};
export default MyJobs;
