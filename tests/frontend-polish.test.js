import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTheme, resolveTheme } from '../src/lib/theme.js';
import { emptyJobDraft, parseJobDraft } from '../src/lib/job-draft.js';
import { getActionMessage } from '../src/lib/notifications.js';
import { getApplications } from '../src/lib/application-tracker.js';

test('theme selection validates stored values and resolves system preference', () => {
  for (const invalid of [null, undefined, '', 'invalid', '__proto__']) assert.equal(normalizeTheme(invalid), 'system');
  assert.equal(normalizeTheme(null, 'dark'), 'dark');
  assert.equal(normalizeTheme('light', 'dark'), 'light');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('employer drafts restore valid data and recover from corrupt storage', () => {
  for (const raw of [null, '', 'broken', 'null', '[]']) assert.deepEqual(parseJobDraft(raw), emptyJobDraft);
  const draft = { ...emptyJobDraft, title: 'Frontend Engineer', company: 'Example', description: 'Build accessible interfaces.', type: 'Contract' };
  assert.deepEqual(parseJobDraft(JSON.stringify(draft)), draft);
  assert.equal(parseJobDraft('{"title":12,"type":"bad"}').title, '');
  assert.equal(parseJobDraft('{"type":"bad"}').type, 'Full-time');
  assert.equal(parseJobDraft(JSON.stringify({ description: 'x'.repeat(6000), company: 'x'.repeat(200) })).description.length, 5000);
  assert.equal(parseJobDraft(JSON.stringify({ company: 'x'.repeat(200) })).company.length, 160);
});

test('shared action feedback distinguishes saving, unsaving and duplicate applications', () => {
  const state = { saved: ['saved'], applied: ['applied'] };
  assert.match(getActionMessage('save', state, 'saved'), /removed/);
  assert.match(getActionMessage('save', state, 'new'), /saved/);
  assert.match(getActionMessage('apply', state, 'applied'), /already/);
  assert.match(getActionMessage('apply', state, 'new'), /Demo/);
  assert.match(getActionMessage('update-application', state, 'applied', { status: 'Offer' }), /Offer/);
});

test('invalid application filter URLs match the visible default selections', () => {
  const state = { saved: [], applied: ['frontend-engineer', 'product-designer'] };
  assert.equal(getApplications(state, new URLSearchParams('location=invalid&status=invalid&sort=invalid')).length, 2);
  assert.equal(getApplications(state, new URLSearchParams('location=Remote')).length, 1);
});
