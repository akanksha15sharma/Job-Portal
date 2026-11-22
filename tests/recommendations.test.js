import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyProfile } from '../src/lib/profile.js';
import { getExperienceYears, getRecommendations, normalizeSkill } from '../src/lib/recommendations.js';
import { jobs } from '../src/data/jobs.js';
import { getDashboardData } from '../src/lib/dashboard.js';
import { updateJobActions } from '../src/lib/job-storage.js';

const now = new Date('2026-11-22T12:00:00Z');
const actions = { saved: [], applied: [] };
const profile = (details = {}) => ({ ...structuredClone(emptyProfile), ...details });
const ranked = (details, activity = actions) => getRecommendations(profile(details), activity, { limit: 6, now });
const frontend = (details) => ranked(details).find(({ job }) => job.id === 'frontend-engineer');

test('full matching profile earns an explained 100-point score', () => {
  const details = { skills: ['React.js', 'TS', 'Tailwind'], preferredRoles: ['Front-end Developer'], preferredLocations: ['Bangalore'], workMode: 'Hybrid', experience: [{ startDate: '2023-01', endDate: '2025-12' }] };
  const result = ranked(details)[0];
  assert.equal(result.job.id, 'frontend-engineer');
  assert.equal(result.score, 100);
  assert.equal(result.source, 'profile');
  assert.equal(result.matchedSkills.length, 3);
  assert.equal(result.unmatchedSkills.length, 0);
  assert.equal(result.score, result.factors.reduce((sum, factor) => sum + Math.round(factor.ratio * factor.weight), 0));
  assert.ok(result.factors.every(({ known }) => known));
  assert.match(result.reason, /preferred role/);
});

test('skill matching handles aliases, case and punctuation without substring matches', () => {
  assert.equal(normalizeSkill(' node.js '), normalizeSkill('Node JS'));
  assert.equal(normalizeSkill('ReactJS'), normalizeSkill('react'));
  assert.notEqual(normalizeSkill('SQL'), normalizeSkill('PostgreSQL'));
  const result = frontend({ skills: ['REACT', 'typescript'] });
  assert.deepEqual(result.matchedSkills, ['React', 'TypeScript']);
  assert.deepEqual(result.unmatchedSkills, ['Tailwind CSS']);
  assert.equal(result.score, 30);
});

test('missing criteria never inflate a partial profile into a perfect match', () => {
  const result = frontend({ preferredLocations: ['Bengaluru'] });
  assert.equal(result.score, 15);
  assert.equal(result.factors.filter(({ known }) => known).length, 1);
  assert.match(result.factors.find(({ key }) => key === 'experience').explanation, /Add experience/);
});

test('preferred roles and locations override headline and current location', () => {
  const result = frontend({ headline: 'Frontend Engineer', preferredRoles: ['Data Analyst'], location: 'Bengaluru, India', preferredLocations: ['Mumbai'] });
  assert.equal(result.factors.find(({ key }) => key === 'role').ratio, 0);
  assert.equal(result.factors.find(({ key }) => key === 'location').ratio, 0);
  const fallback = frontend({ headline: 'Frontend Engineer · Building products', location: 'Bengaluru, India' });
  assert.equal(fallback.factors.find(({ key }) => key === 'role').ratio, 1);
  assert.equal(fallback.factors.find(({ key }) => key === 'location').ratio, 1);
});

test('remote and work-arrangement preferences are honored without treating all cities as remote', () => {
  const remote = ranked({ preferredLocations: ['Remote'], workMode: 'Remote' });
  assert.equal(remote[0].job.id, 'product-designer');
  assert.equal(remote.find(({ job }) => job.id === 'frontend-engineer').factors.find(({ key }) => key === 'location').ratio, 0);
  assert.equal(frontend({ preferredLocations: ['Bengaluru'], workMode: 'Remote' }).factors.find(({ key }) => key === 'location').ratio, 0);
});

test('experience merges concurrent jobs, supports current roles and ignores unusable dates', () => {
  assert.equal(getExperienceYears([{ startDate: '2020-01', endDate: '2021-12' }, { startDate: '2021-01', endDate: '2022-12' }], now), 3);
  assert.equal(getExperienceYears([{ startDate: '2024-01', current: true }], now), 2.9);
  assert.equal(getExperienceYears([{ startDate: '2027-01', current: true }, { startDate: '2025-02', endDate: '2024-01' }, { title: 'Engineer' }], now), null);
  assert.equal(getExperienceYears([{ startDate: '2026-00', endDate: '2026-15' }], now), null);
});

test('experience fit, shortfalls and exceeding a range produce accurate explanations', () => {
  const entry = frontend({ experience: [{ startDate: '2026-01', current: true }] });
  assert.match(entry.factors.find(({ key }) => key === 'experience').explanation, /below/);
  const senior = frontend({ experience: [{ startDate: '2015-01', current: true }] });
  assert.match(senior.factors.find(({ key }) => key === 'experience').explanation, /exceeds/);
  assert.ok(senior.score < 15);
});

test('no-profile suggestions use activity with no invented percentage, then newest starter jobs', () => {
  const starter = ranked({});
  assert.equal(starter[0].source, 'starter');
  assert.equal(starter[0].score, null);
  const activity = ranked({}, { saved: [], applied: ['frontend-engineer'] });
  assert.equal(activity[0].job.id, 'react-developer');
  assert.equal(activity[0].source, 'activity');
  assert.equal(activity[0].score, null);
  assert.match(activity[0].reason, /React/);
});

test('profile scoring remains stable when bookmarks change, while applications are excluded', () => {
  const details = { skills: ['React'] };
  const bookmarked = updateJobActions(actions, 'save', 'frontend-engineer');
  assert.deepEqual(ranked(details), ranked(details, bookmarked));
  const applied = updateJobActions(bookmarked, 'apply', 'frontend-engineer');
  assert.ok(ranked(details, applied).every(({ job }) => job.id !== 'frontend-engineer'));
  assert.equal(ranked(details, { saved: [], applied: jobs.map(({ id }) => id) }).length, 0);
});

test('profile edits rerank recommendations and dashboard uses the same engine', () => {
  assert.equal(ranked({ skills: ['React', 'TypeScript', 'Tailwind CSS'] })[0].job.id, 'frontend-engineer');
  assert.equal(ranked({ skills: ['Figma', 'UX research', 'Design systems'] })[0].job.id, 'product-designer');
  const person = profile({ skills: ['React'] });
  assert.deepEqual(getDashboardData(actions, now, person).recommendations, getRecommendations(person, actions, { now }));
});

test('scores stay bounded, tie ordering is deterministic and inputs are not mutated', () => {
  const person = profile({ skills: ['React'], preferredRoles: ['Engineer'] });
  const original = JSON.stringify({ person, actions, jobs });
  const first = getRecommendations(person, actions, { now, limit: 6 });
  assert.ok(first.every(({ score }) => Number.isInteger(score) && score >= 0 && score <= 100));
  assert.deepEqual(first, getRecommendations(person, actions, { now, limit: 6 }));
  assert.equal(JSON.stringify({ person, actions, jobs }), original);
  assert.equal(getRecommendations(person, actions, { limit: 0 }).length, 0);
});
