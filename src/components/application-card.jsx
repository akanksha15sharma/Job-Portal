import { Link, useLocation } from 'react-router-dom';
import { Check, Trash2 } from 'lucide-react';
import { applicationStatuses } from '@/lib/application-tracker';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded';
const ApplicationCard = ({ job, onUpdate, onRemove, onNotes }) => {
  const location = useLocation();
  const record = job.application;
  const step = applicationStatuses.indexOf(record.status);
  return <article className="surface-card rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby={`application-${job.id}`}>
    <div className="flex items-start gap-3"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary font-semibold">{job.initials}</span><div className="min-w-0 flex-1"><p className="text-sm text-muted-foreground">{job.company}</p><h2 id={`application-${job.id}`} className="mt-1 text-xl font-semibold">{job.title}</h2></div><button type="button" onClick={onRemove} aria-label={`Remove application for ${job.title} at ${job.company}`} className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"><Trash2 aria-hidden="true" className="size-4" /></button></div>
    <p className="mt-4 text-sm text-muted-foreground">{job.location} · {job.mode} · {job.type}</p><p className="mt-2 font-semibold">{job.salary}<span className="font-normal text-muted-foreground"> · {job.experience}</span></p>
    <dl className="my-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm"><div><dt className="text-muted-foreground">Applied</dt><dd className="mt-1">{record.appliedAt ? <time dateTime={record.appliedAt}>{formatDate(record.appliedAt)}</time> : 'Not recorded (older application)'}</dd></div><div><dt className="text-muted-foreground">Last updated</dt><dd className="mt-1">{formatDate(record.updatedAt)}</dd></div></dl>
    <label htmlFor={`status-${job.id}`} className="mb-2 block text-sm font-medium">Application status</label><select id={`status-${job.id}`} value={record.status} onChange={(event) => onUpdate(event.target.value)} className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{applicationStatuses.map((status) => <option key={status}>{status}</option>)}</select>
    <ol aria-label={`Application progress: ${record.status}`} className="my-5 grid grid-cols-3 gap-2">{['Applied', 'Interview', 'Offer'].map((status, index) => <li key={status} aria-current={record.status === status ? 'step' : undefined} className={`border-t-4 pt-3 text-sm ${record.status !== 'Rejected' && index <= step ? 'border-primary font-semibold' : 'border-border text-muted-foreground'}`}><span className="inline-flex items-center gap-1">{record.status !== 'Rejected' && index < step && <Check aria-hidden="true" className="size-3" />}{status}</span></li>)}</ol>
    {record.status === 'Rejected' && <p className="mb-4 rounded-lg bg-secondary p-3 text-sm">Application closed · Rejected. This doesn’t define your next opportunity.</p>}
    <div className="rounded-xl bg-secondary/50 p-4"><h3 className="text-sm font-semibold">Your notes</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{record.notes || 'Add interview reminders, contacts, or next steps.'}</p><button type="button" onClick={onNotes} className="mt-2 min-h-10 rounded px-2 text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{record.notes ? 'Edit notes' : 'Add notes'}</button></div>
    <Link to={`/job/${job.id}`} state={{ from: `${location.pathname}${location.search}` }} className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">View job details</Link>
  </article>;
};
export default ApplicationCard;
