export const jobDraftKey = 'job-portal-employer-draft';
export const emptyJobDraft = { title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '', benefits: '' };
export function parseJobDraft(raw) {
  try {
    const data = JSON.parse(raw);
    const draft = Object.fromEntries(Object.entries(emptyJobDraft).map(([key, fallback]) => [key, typeof data?.[key] === 'string' ? data[key].slice(0, key === 'description' || key === 'requirements' || key === 'benefits' ? 5000 : 160) : fallback]));
    if (!['Full-time', 'Contract'].includes(draft.type)) draft.type = 'Full-time';
    return draft;
  } catch { return { ...emptyJobDraft }; }
}
