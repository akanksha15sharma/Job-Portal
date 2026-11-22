import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, FilePenLine } from 'lucide-react';
import { emptyJobDraft, jobDraftKey, parseJobDraft } from '@/lib/job-draft';
import { notify } from '@/lib/notifications';

const PostJob = () => {
  const [draft, setDraft] = useState(() => { try { return parseJobDraft(localStorage.getItem(jobDraftKey)); } catch { return { ...emptyJobDraft }; } });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const fields = [
    { key: 'title', label: 'Job title', placeholder: 'e.g. Frontend Engineer', required: true },
    { key: 'company', label: 'Company name', placeholder: 'Your company', required: true },
    { key: 'location', label: 'Location', placeholder: 'City or Remote', required: true },
    { key: 'salary', label: 'Salary range', placeholder: 'e.g. ₹12–18 LPA' },
  ];
  return <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="post-heading"><p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Building2 aria-hidden="true" className="size-4" />Employer workspace</p><h1 id="post-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Start with a great job description.</h1><p className="mb-8 mt-4 max-w-2xl leading-7 text-muted-foreground">Create a clear, thoughtful draft for your next hire. Drafts stay private in this browser; this demo does not publish jobs or accept applications for your company.</p>
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]"><form onSubmit={(event) => { event.preventDefault(); try { localStorage.setItem(jobDraftKey, JSON.stringify(draft)); setFeedback('Draft saved in this browser. It has not been published.'); setError(''); notify('Job draft saved in this browser.'); } catch { const message = 'Your browser could not save the draft. Check local storage permissions and try again.'; setError(message); notify(message, 'error'); } }} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div><h2 className="text-xl font-semibold">Role details</h2><p className="mt-2 text-sm text-muted-foreground">Fields marked * are required to save a draft.</p></div><div className="grid gap-5 sm:grid-cols-2">{fields.map(({ key, label, placeholder, required }) => <div key={key}><label htmlFor={`draft-${key}`} className="mb-2 block text-sm font-medium">{label}{required && ' *'}</label><input id={`draft-${key}`} required={required} pattern={required ? '.*\\S.*' : undefined} maxLength={160} value={draft[key]} onChange={(event) => { setDraft({ ...draft, [key]: event.target.value }); setFeedback(''); }} placeholder={placeholder} className="min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base" /></div>)}</div>
      <div><label htmlFor="draft-type" className="mb-2 block text-sm font-medium">Job type</label><select id="draft-type" value={draft.type} onChange={(event) => { setDraft({ ...draft, type: event.target.value }); setFeedback(''); }} className="min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base"><option>Full-time</option><option>Contract</option></select></div>
      {[['description', 'About the role', 'What will this person work on?'], ['requirements', 'Requirements', 'Which skills and experience will help them succeed?'], ['benefits', 'Benefits', 'What can people expect from your team?']].map(([key, label, placeholder]) => <div key={key}><label htmlFor={`draft-${key}`} className="mb-2 block text-sm font-medium">{label}</label><textarea id={`draft-${key}`} rows={4} maxLength={5000} value={draft[key]} onChange={(event) => { setDraft({ ...draft, [key]: event.target.value }); setFeedback(''); }} placeholder={placeholder} className="w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-base leading-7" /></div>)}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5"><button className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"><FilePenLine aria-hidden="true" className="size-4" />Save draft</button><Link to="/dashboard" className="inline-flex min-h-11 items-center rounded px-3 text-sm underline underline-offset-4">Back to dashboard</Link></div><p role="status" className="text-sm leading-6 text-muted-foreground">{feedback}</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form><aside className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Make your role stand out</h2><ul className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">{['Use a familiar, specific job title.', 'Share a realistic salary range and work location.', 'Separate essential skills from nice-to-haves.', 'Explain the work, team, and benefits clearly.'].map((tip) => <li key={tip} className="flex gap-2"><CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />{tip}</li>)}</ul></aside></div>
  </section>;
};
export default PostJob;
