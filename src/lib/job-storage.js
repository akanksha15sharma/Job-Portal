import { applicationStatuses } from './application-tracker.js';
export const jobStorageKey = 'job-portal-actions';
export const emptyActions = { saved: [], applied: [] };

export function parseJobActions(raw) {
  try {
    const data = JSON.parse(raw);
    const ids = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : [];
    const parsed = { saved: ids(data?.saved), applied: ids(data?.applied) };
    if (data?.applications && typeof data.applications === 'object') {
      const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
      parsed.applications = Object.fromEntries(parsed.applied.map((id) => {
        const record = Object.hasOwn(data.applications, id) ? data.applications[id] : null;
        return [id, { status: applicationStatuses.includes(record?.status) ? record.status : 'Applied', notes: typeof record?.notes === 'string' ? record.notes.slice(0, 5000) : '', appliedAt: validDate(record?.appliedAt), updatedAt: validDate(record?.updatedAt) }];
      }));
    }
    return parsed;
  } catch {
    return emptyActions;
  }
}

export function updateJobActions(current, action, id, details = {}, now = new Date().toISOString()) {
  if (action === 'remove-application') {
    const applications = { ...current.applications };
    delete applications[id];
    return { ...current, applied: current.applied.filter((item) => item !== id), applications };
  }
  if (action === 'update-application' && current.applied.includes(id)) {
    const record = current.applications?.[id] || { status: 'Applied', notes: '', appliedAt: null, updatedAt: null };
    return { ...current, applications: { ...current.applications, [id]: {
      ...record,
      status: applicationStatuses.includes(details.status) ? details.status : record.status,
      notes: typeof details.notes === 'string' ? details.notes.slice(0, 5000) : record.notes,
      updatedAt: now,
    } } };
  }
  if (action === 'clear-saved') return { ...current, saved: [] };
  if (action === 'remove-saved') return { ...current, saved: current.saved.filter((item) => item !== id) };
  if (action === 'save') return { ...current, saved: current.saved.includes(id) ? current.saved.filter((item) => item !== id) : [...current.saved, id] };
  if (action === 'apply') {
    if (current.applied.includes(id)) return current;
    return { ...current, applied: [...current.applied, id], applications: { ...current.applications, [id]: { status: 'Applied', notes: '', appliedAt: now, updatedAt: now } } };
  }
  return current;
}
