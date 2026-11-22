import { useRef, useState } from 'react';
import { emptyAlert, getAlertMatches, validateAlert } from '@/lib/job-alerts';
import { locations } from '@/data/jobs';
import { experienceLevels, jobTypes } from '@/lib/job-filters';

const control = 'min-h-12 w-full rounded-lg border border-input bg-background px-3 py-3 text-base';
const JobAlertForm = ({ initial = emptyAlert, onSave, onCancel, error }) => {
  const [draft, setDraft] = useState(() => ({ ...initial, skillsText: initial.skills.join(', ') }));
  const [submitted, setSubmitted] = useState(false);
  const errorRef = useRef(null);
  const candidate = { ...draft, skills: [...new Set(draft.skillsText.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean))] };
  const errors = validateAlert(candidate);
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const field = (key, label, props = {}) => { const errorKey = key === 'skillsText' ? 'skills' : key; return <div><label htmlFor={`alert-${key}`} className="mb-2 block text-sm font-medium">{label}</label><input id={`alert-${key}`} value={draft[key]} onChange={(event) => set(key, event.target.value)} aria-invalid={submitted && !!errors[errorKey]} aria-describedby={submitted && errors[errorKey] ? `alert-error-${errorKey}` : undefined} className={`${control} ${submitted && errors[errorKey] ? 'border-destructive' : ''}`} {...props} />{submitted && errors[errorKey] && <p id={`alert-error-${errorKey}`} className="mt-2 text-sm text-destructive">{errors[errorKey]}</p>}</div>; };
  return <form noValidate onSubmit={(event) => { event.preventDefault(); setSubmitted(true); if (Object.keys(errors).length) { requestAnimationFrame(() => errorRef.current?.focus()); return; } onSave(candidate); }} className="space-y-5">
    <p className="text-sm leading-6 text-muted-foreground">All selected criteria must match. Every skill is required; salary ranges overlap. Leave criteria blank to follow all sample jobs.</p>
    {submitted && Object.keys(errors).length > 0 && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg border border-destructive p-3 text-sm">Please correct the highlighted fields before saving.</p>}
    {field('name', 'Alert name *', { maxLength: 80, autoFocus: true, required: true, placeholder: 'e.g. React roles in Bengaluru' })}
    <div className="grid gap-5 sm:grid-cols-2">{field('title', 'Job title keywords', { maxLength: 120, placeholder: 'e.g. Engineer' })}{field('skillsText', 'Required skills (comma separated)', { maxLength: 1000, placeholder: 'e.g. React, TypeScript' })}
      {[{ key: 'location', label: 'Location', placeholder: 'All locations', options: locations.map((value) => ({ value, label: value })) }, { key: 'type', label: 'Job type', placeholder: 'All job types', options: jobTypes.map((value) => ({ value, label: value })) }, { key: 'experience', label: 'Experience level', placeholder: 'All experience levels', options: experienceLevels }].map(({ key, label, placeholder, options }) => <div key={key}><label htmlFor={`alert-${key}`} className="mb-2 block text-sm font-medium">{label}</label><select id={`alert-${key}`} value={draft[key]} onChange={(event) => set(key, event.target.value)} className={control}><option value="">{placeholder}</option>{options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}</select></div>)}
      {field('salaryMin', 'Minimum annual salary (LPA)', { type: 'number', min: 0, max: 1000, step: '0.1', inputMode: 'decimal' })}{field('salaryMax', 'Maximum annual salary (LPA)', { type: 'number', min: 0, max: 1000, step: '0.1', inputMode: 'decimal' })}
    </div>
    <p className="text-sm text-muted-foreground">LPA means lakhs per year in INR. Salary filters match any overlap with the advertised range.</p><label className="inline-flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" checked={draft.enabled} onChange={(event) => set('enabled', event.target.checked)} className="size-4" />Alert active</label>
    <p role="status" className="rounded-lg bg-secondary/50 p-4 text-sm leading-6">{Object.keys(errors).some((key) => key !== 'name') ? 'Correct the criteria to preview matches.' : `${getAlertMatches(candidate).length} current sample jobs match these criteria.${draft.enabled ? ' New matches will appear in your notification center.' : ' This alert is paused; no new notifications will be added.'}`}</p>
    {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}<div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5"><button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent">Cancel</button><button className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Save alert</button></div>
  </form>;
};
export default JobAlertForm;
