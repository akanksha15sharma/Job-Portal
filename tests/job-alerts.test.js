import assert from 'node:assert/strict';
import test from 'node:test';
import { jobs } from '../src/data/jobs.js';
import { emptyAlert, getAlertMatches, normalizeAlert, parseAlertState, reconcileAlertMatches, updateAlertState, validateAlert } from '../src/lib/job-alerts.js';

const now = '2026-11-22T12:00:00.000Z';
const later = '2026-11-23T12:00:00.000Z';
const blank = () => ({ alerts: [], notifications: [] });
const create = (state, id, criteria = {}, enabled = true) => updateAlertState(state, 'save', { id, alert: { ...emptyAlert, name: id, ...criteria, enabled } }, now);
const reconcile = (state, catalog = jobs, date = now) => reconcileAlertMatches(state, catalog, date);

test('combines title, every required skill, location, salary, type and experience', () => {
  const alert = { ...emptyAlert, title: '  FRONTEND  engineer ', skills: ['ReactJS', 'TS'], location: 'bengaluru', salaryMin: '17', salaryMax: '20', type: 'Full-time', experience: 'mid' };
  assert.deepEqual(getAlertMatches(alert).map(({ id }) => id), ['frontend-engineer']);
  assert.equal(getAlertMatches({ ...alert, skills: ['React', 'Python'] }).length, 0);
  assert.equal(getAlertMatches({ ...alert, type: 'Contract' }).length, 0);
  assert.equal(getAlertMatches({ ...alert, experience: 'senior' }).length, 0);
  assert.equal(getAlertMatches({ ...alert, location: 'Remote' }).length, 0);
});

test('salary ranges overlap inclusively and empty criteria follow all jobs', () => {
  assert.equal(getAlertMatches(emptyAlert).length, jobs.length);
  assert.ok(getAlertMatches({ ...emptyAlert, salaryMin: '18', salaryMax: '18' }).some(({ id }) => id === 'frontend-engineer'));
  assert.ok(!getAlertMatches({ ...emptyAlert, salaryMin: '19' }).some(({ id }) => id === 'frontend-engineer'));
  assert.equal(getAlertMatches({ ...emptyAlert, location: 'Remote' })[0].id, 'product-designer');
});

test('validates alert names, salary inputs, bounds and skill limits', () => {
  assert.ok(validateAlert(emptyAlert).name);
  const errors = validateAlert({ ...emptyAlert, name: 'Alert', salaryMin: '20', salaryMax: '10' });
  assert.ok(errors.salaryMax);
  assert.ok(validateAlert({ ...emptyAlert, name: 'Alert', salaryMin: '-1' }).salaryMin);
  assert.ok(validateAlert({ ...emptyAlert, name: 'Alert', salaryMax: 'Infinity' }).salaryMax);
  assert.ok(validateAlert({ ...emptyAlert, name: 'Alert', skills: ['x'.repeat(81)] }).skills);
  assert.ok(validateAlert({ ...emptyAlert, name: 'Alert', skills: Array.from({ length: 31 }, (_, index) => `skill${index}`) }).skills);
});

test('one notification per job across overlapping alerts and repeated checks', () => {
  const state = create(create(blank(), 'react', { skills: ['React'] }), 'frontend', { title: 'Frontend' });
  const first = reconcile(state);
  assert.equal(first.notifications.length, 2);
  assert.deepEqual(first.notifications.find(({ jobId }) => jobId === 'frontend-engineer').alertIds, ['react', 'frontend']);
  assert.deepEqual(reconcile(first, jobs, later), first);
  assert.equal(new Set(first.notifications.map(({ id }) => id)).size, first.notifications.length);
});

test('paused alerts do not generate matches and resume picks up new jobs only', () => {
  let state = reconcile(create(blank(), 'react', { skills: ['React'] }, false));
  assert.equal(state.notifications.length, 0);
  state = reconcile(updateAlertState(state, 'toggle', { id: 'react' }, now));
  assert.equal(state.notifications.length, 2);
  state = updateAlertState(state, 'read-all', {}, now);
  state = updateAlertState(state, 'toggle', { id: 'react' }, later);
  const newJob = { ...jobs[0], id: 'new-frontend' };
  state = reconcile(state, [...jobs, newJob], later);
  assert.equal(state.notifications.length, 2);
  state = reconcile(updateAlertState(state, 'toggle', { id: 'react' }, later), [...jobs, newJob], later);
  assert.equal(state.notifications.length, 3);
  assert.equal(state.notifications.filter(({ readAt }) => !readAt).length, 1);
  assert.equal(state.notifications.find(({ jobId }) => jobId === 'new-frontend').createdAt, later);
});

test('editing expands matches without resetting notification dates or read states', () => {
  let state = reconcile(create(blank(), 'roles', { title: 'Frontend' }));
  state = updateAlertState(state, 'read-all', {}, now);
  state = reconcile(updateAlertState(state, 'save', { id: 'roles', edit: true, expectedUpdatedAt: now, alert: { ...state.alerts[0], title: '', skills: ['React'] } }, later), jobs, later);
  assert.equal(state.notifications.length, 2);
  assert.equal(state.notifications.find(({ jobId }) => jobId === 'frontend-engineer').readAt, now);
  assert.equal(state.notifications.find(({ jobId }) => jobId === 'frontend-engineer').createdAt, now);
  assert.equal(state.notifications.find(({ jobId }) => jobId === 'react-developer').readAt, null);
});

test('deleting and recreating an overlapping alert preserves notification history without duplicates', () => {
  let state = reconcile(create(blank(), 'react', { skills: ['React'] }));
  state = updateAlertState(state, 'read-all', {}, now);
  state = updateAlertState(state, 'delete', { id: 'react' }, later);
  assert.equal(state.alerts.length, 0);
  assert.equal(state.notifications.length, 2);
  state = reconcile(create(state, 'replacement', { skills: ['React'] }), jobs, later);
  assert.equal(state.notifications.length, 2);
  assert.ok(state.notifications.every(({ readAt }) => readAt === now));
});

test('individual read, mark-all and unread actions persist through reload', () => {
  let state = reconcile(create(blank(), 'all'));
  state = updateAlertState(state, 'read', { id: state.notifications[0].id }, now);
  assert.equal(state.notifications.filter(({ readAt }) => !readAt).length, 5);
  const id = state.notifications[0].id;
  state = updateAlertState(state, 'unread', { id }, later);
  assert.equal(state.notifications.filter(({ readAt }) => !readAt).length, 6);
  state = updateAlertState(state, 'read-all', {}, later);
  assert.deepEqual(parseAlertState(JSON.stringify(state)), state);
  assert.ok(reconcile(parseAlertState(JSON.stringify(state))).notifications.every(({ readAt }) => readAt));
});

test('parsing recovers malformed storage and collapses duplicate notification records', () => {
  for (const raw of [null, '', 'broken', 'null', '[]']) assert.deepEqual(parseAlertState(raw), blank());
  const parsed = parseAlertState(JSON.stringify({ alerts: [null, {}, { id: 'bad id', name: 'bad' }], notifications: [null, { jobId: 'frontend-engineer', alertIds: ['one'], alertNames: ['First'], readAt: now }, { jobId: 'frontend-engineer', alertIds: ['two'], alertNames: ['Second'], readAt: null }] }));
  assert.equal(parsed.alerts.length, 0);
  assert.equal(parsed.notifications.length, 1);
  assert.deepEqual(parsed.notifications[0].alertIds, ['one', 'two']);
  assert.equal(parsed.notifications[0].readAt, now);
  assert.equal(normalizeAlert({ skills: 12, type: 'invalid', experience: 'invalid' }).type, '');
});

test('stale edits are rejected and alert limits are enforced', () => {
  const state = create(blank(), 'one');
  const changed = updateAlertState(state, 'toggle', { id: 'one' }, later);
  assert.throws(() => updateAlertState(changed, 'save', { id: 'one', edit: true, expectedUpdatedAt: now, alert: state.alerts[0] }, later), /another tab/);
  assert.throws(() => updateAlertState(blank(), 'save', { id: 'one', edit: true, alert: state.alerts[0] }, later), /deleted/);
  let maximum = blank();
  for (let index = 0; index < 20; index++) maximum = create(maximum, `alert-${index}`);
  assert.throws(() => create(maximum, 'too-many'), /20 alerts/);
});

test('matching and updates do not mutate the previous state or job catalog', () => {
  const state = create(blank(), 'react', { skills: ['React'] });
  const original = JSON.stringify({ state, jobs });
  reconcile(state);
  updateAlertState(state, 'toggle', { id: 'react' }, later);
  assert.equal(JSON.stringify({ state, jobs }), original);
});
