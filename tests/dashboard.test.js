import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardData } from '../src/lib/dashboard.js';
import { jobs } from '../src/data/jobs.js';
import { updateJobActions } from '../src/lib/job-storage.js';

const now = new Date('2026-11-22T12:00:00.000Z');
const empty = { saved: [], applied: [] };
const apply = (state, id, date = '2026-11-20T10:00:00.000Z') => updateJobActions(state, 'apply', id, {}, date);

test('empty dashboard shows honest zero counts and useful starter recommendations', () => {
  const data = getDashboardData(empty, now);
  assert.equal(data.savedJobs.length, 0);
  assert.equal(data.applications.length, 0);
  assert.deepEqual(data.counts, { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  assert.equal(data.recent.length, 0);
  assert.equal(data.recommendations.length, 3);
  assert.ok(data.trend.every(({ count }) => count === 0));
});

test('metrics count actual records and reflect application status changes', () => {
  let state = apply(apply(empty, 'frontend-engineer'), 'product-designer');
  state = updateJobActions(state, 'save', 'react-developer');
  state = updateJobActions(state, 'update-application', 'frontend-engineer', { status: 'Interview' });
  let data = getDashboardData(state, now);
  assert.equal(data.savedJobs.length, 1);
  assert.equal(data.applications.length, 2);
  assert.deepEqual(data.counts, { Applied: 1, Interview: 1, Offer: 0, Rejected: 0 });
  state = updateJobActions(state, 'update-application', 'frontend-engineer', { status: 'Offer' });
  data = getDashboardData(state, now);
  assert.equal(data.counts.Interview, 0);
  assert.equal(data.counts.Offer, 1);
});

test('recommendations prioritize shared skills and exclude applied roles', () => {
  const state = apply(empty, 'frontend-engineer');
  const data = getDashboardData(state, now);
  assert.equal(data.recommendations[0].job.id, 'react-developer');
  assert.match(data.recommendations[0].reason, /React/);
  assert.ok(data.recommendations.every(({ job }) => !state.applied.includes(job.id)));
  assert.equal(getDashboardData({ saved: [], applied: jobs.map(({ id }) => id) }, now).recommendations.length, 0);
});

test('recent applications sort by actual application dates with legacy fallback', () => {
  const state = apply(apply({ saved: [], applied: ['data-analyst'] }, 'frontend-engineer', '2026-10-01T00:00:00.000Z'), 'product-designer', '2026-11-01T00:00:00.000Z');
  assert.deepEqual(getDashboardData(state, now).recent.map(({ id }) => id), ['product-designer', 'frontend-engineer', 'data-analyst']);
});

test('activity uses UTC calendar months, excludes missing and future dates', () => {
  let state = { saved: [], applied: ['marketing-specialist'] };
  state = apply(state, 'frontend-engineer', '2026-06-01T00:00:00.000Z');
  state = apply(state, 'product-designer', '2026-10-31T23:59:59.000Z');
  state = apply(state, 'backend-developer', '2026-11-01T00:00:00.000Z');
  state = apply(state, 'data-analyst', '2026-11-30T00:00:00.000Z');
  state = apply(state, 'react-developer', '2026-05-31T23:59:59.000Z');
  const { trend } = getDashboardData(state, now);
  assert.deepEqual(trend.map(({ key }) => key), ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
  assert.deepEqual(trend.map(({ count }) => count), [1, 0, 0, 0, 1, 1]);
});

test('removed, duplicated and stale IDs do not inflate metrics or mutate storage data', () => {
  const state = { saved: ['frontend-engineer', 'frontend-engineer', 'missing'], applied: ['product-designer', 'product-designer', 'missing'] };
  const snapshot = JSON.stringify(state);
  const data = getDashboardData(state, now);
  assert.equal(data.savedJobs.length, 1);
  assert.equal(data.applications.length, 1);
  assert.equal(JSON.stringify(state), snapshot);
  const removed = updateJobActions(state, 'remove-application', 'product-designer');
  assert.equal(getDashboardData(removed, now).applications.length, 0);
});
