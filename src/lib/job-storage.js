export const jobStorageKey = 'job-portal-actions';
export const emptyActions = { saved: [], applied: [] };

export function parseJobActions(raw) {
  try {
    const data = JSON.parse(raw);
    const ids = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : [];
    return { saved: ids(data?.saved), applied: ids(data?.applied) };
  } catch {
    return emptyActions;
  }
}

export function updateJobActions(current, action, id) {
  if (action === 'save') return { ...current, saved: current.saved.includes(id) ? current.saved.filter((item) => item !== id) : [...current.saved, id] };
  if (action === 'apply') return { ...current, applied: [...new Set([...current.applied, id])] };
  return current;
}
