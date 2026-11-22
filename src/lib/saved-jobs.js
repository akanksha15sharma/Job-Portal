import { getJobResults, readJobFilters } from './job-filters.js';

export function getSavedJobResults(saved, params) {
  const ids = new Set(saved);
  // Saved Jobs supports its own keyword, location, type, and sort controls.
  const supported = new URLSearchParams();
  for (const key of ['q', 'location', 'type', 'sort']) {
    if (params.has(key)) supported.set(key, params.get(key));
  }
  return getJobResults(readJobFilters(supported)).filter((job) => ids.has(job.id));
}
