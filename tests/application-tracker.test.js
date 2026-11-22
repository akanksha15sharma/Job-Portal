import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJobActions, updateJobActions } from '../src/lib/job-storage.js';
import { getApplications } from '../src/lib/application-tracker.js';

const date = '2026-11-22T09:00:00.000Z';
const later = '2026-11-23T10:00:00.000Z';
const initial = { saved: ['frontend-engineer'], applied: [] };
const apply = (state, id, at = date) => updateJobActions(state, 'apply', id, {}, at);

test('new applications record dates, status and notes and survive reload', () => {
  const state = apply(initial, 'frontend-engineer');
  assert.deepEqual(state.applications['frontend-engineer'], { status: 'Applied', notes: '', appliedAt: date, updatedAt: date });
  assert.deepEqual(parseJobActions(JSON.stringify(state)), state);
  assert.deepEqual(apply(state, 'frontend-engineer', later), state);
  assert.deepEqual(initial.applied, []);
});

test('legacy applications remain visible without fabricated dates', () => {
  const state = parseJobActions('{"saved":[],"applied":["frontend-engineer"]}');
  const job = getApplications(state)[0];
  assert.equal(job.application.status, 'Applied');
  assert.equal(job.application.appliedAt, null);
  const updated = updateJobActions(state, 'update-application', job.id, { notes: 'Call recruiter' }, later);
  assert.equal(updated.applications[job.id].appliedAt, null);
  assert.equal(updated.applications[job.id].notes, 'Call recruiter');
});

test('status and notes updates preserve independent fields and original date', () => {
  const state = apply(initial, 'frontend-engineer');
  const interview = updateJobActions(state, 'update-application', 'frontend-engineer', { status: 'Interview' }, later);
  const notes = updateJobActions(interview, 'update-application', 'frontend-engineer', { notes: 'Prepare React examples' }, later);
  assert.deepEqual(notes.applications['frontend-engineer'], { status: 'Interview', notes: 'Prepare React examples', appliedAt: date, updatedAt: later });
  assert.equal(state.applications['frontend-engineer'].status, 'Applied');
  assert.equal(updateJobActions(notes, 'update-application', 'frontend-engineer', { status: 'invalid' }, later).applications['frontend-engineer'].status, 'Interview');
  assert.deepEqual(updateJobActions(state, 'update-application', 'missing', { status: 'Offer' }), state);
});

test('removal deletes metadata, preserves bookmarks, and allows a fresh application', () => {
  const state = apply(initial, 'frontend-engineer');
  const removed = updateJobActions(state, 'remove-application', 'frontend-engineer');
  assert.deepEqual(removed.saved, state.saved);
  assert.equal(removed.applied.length, 0);
  assert.equal(removed.applications['frontend-engineer'], undefined);
  assert.equal(apply(removed, 'frontend-engineer', later).applications['frontend-engineer'].appliedAt, later);
});

test('corrupt metadata is normalized and orphan records ignored', () => {
  const state = parseJobActions(JSON.stringify({ saved: [], applied: ['frontend-engineer'], applications: { 'frontend-engineer': { status: 'invalid', notes: 12, appliedAt: 'bad date' }, missing: { status: 'Offer' } } }));
  assert.deepEqual(state.applications, { 'frontend-engineer': { status: 'Applied', notes: '', appliedAt: null, updatedAt: null } });
  const longNotes = updateJobActions(state, 'update-application', 'frontend-engineer', { notes: 'x'.repeat(6000) }, date);
  assert.equal(longNotes.applications['frontend-engineer'].notes.length, 5000);
});

test('search, status and location combine and sorts use application dates', () => {
  let state = apply(apply(initial, 'frontend-engineer'), 'product-designer', later);
  state = updateJobActions(state, 'update-application', 'frontend-engineer', { status: 'Interview' }, later);
  assert.equal(getApplications(state)[0].id, 'product-designer');
  assert.equal(getApplications(state, new URLSearchParams('sort=oldest'))[0].id, 'frontend-engineer');
  assert.equal(getApplications(state, new URLSearchParams('q=REACT&status=Interview&location=Bengaluru')).length, 1);
  assert.equal(getApplications(state, new URLSearchParams('status=Offer')).length, 0);
  assert.equal(getApplications(state, new URLSearchParams('sort=salary'))[0].id, 'frontend-engineer');
  assert.equal(getApplications(state, new URLSearchParams('sort=company'))[0].id, 'product-designer');
  assert.equal(getApplications({ applied: ['missing'], saved: [] }).length, 0);
});
