import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyProfile, getProfileCompletion, isValidResume, maxResumeBytes, parseProfile, readResumeFile, safeProfileUrl, splitProfileTags, validateProfile } from '../src/lib/profile.js';

const profile = (details = {}) => ({ ...structuredClone(emptyProfile), fullName: 'Alex Morgan', email: 'alex@example.com', ...details });
const pdfData = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\n%%EOF').toString('base64');
const resume = { name: 'resume.pdf', size: 14, data: pdfData };

test('profile parsing tolerates corrupt storage and preserves supported fields', () => {
  for (const raw of [null, '', 'invalid', 'null', '[]']) assert.deepEqual(parseProfile(raw), emptyProfile);
  const parsed = parseProfile(JSON.stringify(profile({ skills: ['React', 'React', 2], experience: [{ title: 'Engineer', company: 'Example', current: true }], resume })));
  assert.deepEqual(parsed.skills, ['React']);
  assert.equal(parsed.experience[0].current, true);
  assert.equal(parsed.fullName, 'Alex Morgan');
  assert.deepEqual(parsed.resume, resume);
  assert.equal(validateProfile(parsed).fullName, undefined);
});

test('validates personal details, safe URLs and salary ranges', () => {
  assert.deepEqual(validateProfile(profile()), {});
  const errors = validateProfile(profile({ fullName: ' ', email: 'bad', phone: '12abc', website: 'javascript:alert(1)', salaryMin: '20', salaryMax: '10' }));
  for (const key of ['fullName', 'email', 'phone', 'website', 'salaryMax']) assert.ok(errors[key]);
  assert.ok(validateProfile(profile({ salaryMin: '-1' })).salaryMin);
  assert.ok(validateProfile(profile({ salaryMax: 'Infinity' })).salaryMax);
  assert.equal(safeProfileUrl('https://example.com/portfolio'), 'https://example.com/portfolio');
  assert.equal(safeProfileUrl('javascript:alert(1)'), null);
  assert.deepEqual(validateProfile(profile({ phone: '+91 98765 43210', salaryMin: '12.5', salaryMax: '18' })), {});
});

test('validates required repeatable records, project URLs and date ordering', () => {
  const errors = validateProfile(profile({ education: [{ institution: '', degree: '', startDate: '2024-01', endDate: '2020-01' }], experience: [{ title: '', company: '', startDate: '2024-15', endDate: '' }], projects: [{ name: '', url: 'ftp://example.com' }] }));
  for (const key of ['education.0.institution', 'education.0.degree', 'education.0.endDate', 'experience.0.title', 'experience.0.company', 'experience.0.startDate', 'projects.0.name', 'projects.0.url']) assert.ok(errors[key]);
  assert.equal(validateProfile(profile({ experience: [{ title: 'Engineer', company: 'Example', startDate: '2024-01', endDate: '', current: true }] }))['experience.0.endDate'], undefined);
});

test('tag parsing deduplicates values and caps oversized inputs', () => {
  assert.deepEqual(splitProfileTags('React, SQL\nReact, , Figma'), ['React', 'SQL', 'Figma']);
  assert.equal(splitProfileTags(Array.from({ length: 40 }, (_, index) => `skill${index}`).join(',')).length, 30);
  assert.ok(validateProfile(profile({ skills: ['x'.repeat(81)] })).skills);
});

test('completion recognizes projects as an alternative to experience', () => {
  assert.equal(getProfileCompletion(emptyProfile).percent, 0);
  const complete = profile({ location: 'Bengaluru', headline: 'Engineer', bio: 'Building thoughtful software.', skills: ['React'], education: [{ institution: 'Example University', degree: 'BSc' }], projects: [{ name: 'Portfolio' }], preferredRoles: ['Engineer'], preferredLocations: ['Remote'], salaryMin: '12', resume });
  assert.equal(getProfileCompletion(complete).percent, 100);
  const withoutResume = getProfileCompletion({ ...complete, resume: null });
  assert.equal(withoutResume.percent, 86);
  assert.equal(withoutResume.sections.find(({ id }) => id === 'resume').complete, false);
});

test('resume metadata permits only bounded PDFs with a PDF signature', () => {
  assert.equal(isValidResume(resume), true);
  for (const invalid of [{ ...resume, name: 'resume.html' }, { ...resume, data: 'javascript:alert(1)' }, { ...resume, data: 'data:text/html;base64,JVBERi0=' }, { ...resume, data: 'data:application/pdf;base64,AAAA' }, { ...resume, size: maxResumeBytes + 1 }]) {
    assert.equal(isValidResume(invalid), false);
    assert.equal(parseProfile(JSON.stringify({ resume: invalid })).resume, null);
  }
});

test('file validation rejects oversized, empty, wrong-type and disguised files before reading', async () => {
  for (const file of [null, { name: 'a.pdf', type: 'application/pdf', size: 0 }, { name: 'a.pdf', type: 'application/pdf', size: maxResumeBytes + 1 }, { name: 'a.txt', type: 'text/plain', size: 12 }]) await assert.rejects(() => readResumeFile(file), /PDF/);
  const disguised = { name: 'a.pdf', type: 'application/pdf', size: 12, slice: () => new Blob(['notPDF']) };
  await assert.rejects(() => readResumeFile(disguised), /does not appear to be a PDF/);
});

test('editing copies are independent and roundtrip keeps all profile sections', () => {
  const original = profile({ education: [{ institution: 'University', degree: 'BSc' }], projects: [{ name: 'App', url: 'https://example.com' }], resume, preferredRoles: ['Developer'] });
  const copy = structuredClone(original);
  copy.fullName = 'Different'; copy.education[0].institution = 'Changed';
  assert.equal(original.fullName, 'Alex Morgan');
  assert.equal(original.education[0].institution, 'University');
  const saved = parseProfile(JSON.stringify(original));
  const reloaded = parseProfile(JSON.stringify(saved));
  assert.deepEqual(reloaded, saved);
});
