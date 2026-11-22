import assert from 'node:assert/strict';
import test from 'node:test';
import { jobs } from '../src/data/jobs.js';
import { getSavedJobResults } from '../src/lib/saved-jobs.js';
import { parseJobActions, updateJobActions } from '../src/lib/job-storage.js';

const ids = jobs.map((job) => job.id);
const find = (saved, query = '') => getSavedJobResults(saved, new URLSearchParams(query));

test('shows only bookmarked jobs and ignores stale IDs and duplicates', () => {
  assert.deepEqual(find(['react-developer', 'missing', 'react-developer']).map((job) => job.id), ['react-developer']);
  assert.equal(find([]).length, 0);
});

test('combines keyword, location and type within the saved collection', () => {
  assert.deepEqual(find(ids, 'q=REACT&location=Pune&type=Contract').map((job) => job.id), ['react-developer']);
  assert.equal(find(['frontend-engineer'], 'q=React&location=Pune').length, 0);
  assert.equal(find(ids, 'q=Northstar+Labs')[0].id, 'frontend-engineer');
  assert.equal(find(ids, 'q=unmatched').length, 0);
});

test('sorts saved jobs by posting date and numeric salary in either direction', () => {
  assert.equal(find(ids)[0].id, 'data-analyst');
  assert.equal(find(ids, 'sort=salary-desc')[0].id, 'backend-developer');
  assert.equal(find(ids, 'sort=salary-asc')[0].id, 'marketing-specialist');
});

test('restores filters from shared URL state and clears back to the full shortlist', () => {
  const params = new URLSearchParams('q=React&location=Pune&type=Contract&sort=salary-desc');
  assert.deepEqual(getSavedJobResults(ids, new URLSearchParams(params.toString())), getSavedJobResults(ids, params));
  assert.equal(getSavedJobResults(ids, new URLSearchParams()).length, ids.length);
  // Parameters belonging to the jobs page must not invisibly filter this page.
  assert.equal(find(ids, 'remote=true&experience=senior&salary=20-plus').length, ids.length);
});

test('individual removal is idempotent and preserves applications', () => {
  const current = { saved: [...ids], applied: ['react-developer'] };
  const next = updateJobActions(current, 'remove-saved', 'react-developer');
  assert.ok(!next.saved.includes('react-developer'));
  assert.deepEqual(next.applied, current.applied);
  assert.deepEqual(updateJobActions(next, 'remove-saved', 'react-developer'), next);
  assert.equal(current.saved.length, ids.length);
});

test('clear all removes hidden jobs as well as visible jobs and survives reload', () => {
  const current = { saved: [...ids], applied: ['frontend-engineer'] };
  assert.equal(find(current.saved, 'location=Remote').length, 1);
  const next = parseJobActions(JSON.stringify(updateJobActions(current, 'clear-saved')));
  assert.deepEqual(next, { saved: [], applied: ['frontend-engineer'] });
  assert.equal(find(next.saved).length, 0);
  assert.equal(current.saved.length, ids.length);
});

test('apply from saved collection persists once without removing the bookmark', () => {
  const current = { saved: ['frontend-engineer'], applied: [] };
  const next = updateJobActions(current, 'apply', 'frontend-engineer');
  const restored = parseJobActions(JSON.stringify(next));
  assert.deepEqual(restored, { saved: ['frontend-engineer'], applied: ['frontend-engineer'] });
  assert.deepEqual(updateJobActions(restored, 'apply', 'frontend-engineer'), restored);
});
