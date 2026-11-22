import assert from 'node:assert/strict';
import test from 'node:test';
import { jobs } from '../src/data/jobs.js';
import { getJobResults, readJobFilters } from '../src/lib/job-filters.js';

const results = (search) => getJobResults(readJobFilters(new URLSearchParams(search)));

test('combines keyword, location, type, experience, salary, and sort', () => {
  assert.deepEqual(results('q=react&location=Pune&type=Contract&experience=mid&salary=10-15&sort=salary-desc').map((job) => job.id), ['react-developer']);
  assert.equal(results('q=react&location=Pune&type=Full-time').length, 0);
});

test('normalizes keywords and supports company searches', () => {
  assert.equal(results('q=%20REACT%20').length, 2);
  assert.equal(results('q=Northstar%20Labs')[0].id, 'frontend-engineer');
});

test('filters location, job type, and experience independently', () => {
  assert.equal(results('location=Remote')[0].id, 'product-designer');
  assert.ok(results('type=Contract').every((job) => job.type === 'Contract'));
  for (const level of ['junior', 'mid', 'senior']) {
    const matches = results(`experience=${level}`);
    assert.ok(matches.length > 0);
    assert.ok(matches.every((job) => job.experienceLevel === level));
  }
});

test('salary buckets include intersecting advertised ranges and respect boundaries', () => {
  assert.deepEqual(results('salary=under-10').map((job) => job.id).sort(), ['data-analyst', 'marketing-specialist', 'react-developer']);
  assert.deepEqual(results('salary=20-plus').map((job) => job.id), ['backend-developer']);
  assert.ok(!results('salary=10-15').some((job) => job.id === 'backend-developer'));
  assert.ok(results('salary=15-20').some((job) => job.id === 'backend-developer'));
});

test('sorts salaries numerically in both directions and dates newest first', () => {
  const ascending = results('sort=salary-asc');
  const descending = results('sort=salary-desc');
  assert.equal(ascending[0].id, 'marketing-specialist');
  assert.equal(descending[0].id, 'backend-developer');
  assert.deepEqual(ascending.map((job) => job.id).reverse(), descending.map((job) => job.id));
  const newest = results('sort=newest');
  assert.equal(newest[0].id, 'data-analyst');
  assert.ok(newest.every((job, index) => !index || newest[index - 1].postedAt >= job.postedAt));
});

test('URL state can be serialized and independently restored without stale selections', () => {
  const first = new URLSearchParams('q=React&type=Contract&experience=mid&salary=10-15&location=Pune&sort=salary-asc');
  const restored = new URLSearchParams(first.toString());
  assert.deepEqual(readJobFilters(restored), readJobFilters(first));
  assert.equal(results(restored)[0].id, 'react-developer');
  assert.equal(results('location=Remote')[0].id, 'product-designer');
  assert.equal(results(first)[0].id, 'react-developer');
  assert.equal(results('').length, jobs.length);
});

test('unknown URL filter values fall back to valid defaults', () => {
  const filters = readJobFilters(new URLSearchParams('type=invalid&experience=invalid&salary=invalid&sort=invalid&location=invalid'));
  assert.deepEqual(filters, { query: '', location: '', type: '', experience: '', salary: '', sort: 'newest' });
  assert.equal(getJobResults(filters).length, jobs.length);
});

test('filtering and sorting do not mutate shared sample data', () => {
  const original = JSON.stringify(jobs);
  results('sort=salary-desc');
  results('experience=senior&salary=20-plus');
  assert.equal(JSON.stringify(jobs), original);
});
