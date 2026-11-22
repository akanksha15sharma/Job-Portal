import { jobs } from '../data/jobs.js';
import { emptyProfile } from './profile.js';

const normalize = (value) => value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}+#]+/gu, ' ').trim();
const skillAliases = { js: 'javascript', ts: 'typescript', reactjs: 'react', node: 'nodejs', postgres: 'postgresql', tailwind: 'tailwindcss' };
export const normalizeSkill = (value) => {
  const compact = normalize(value).replace(/\s/g, '');
  return skillAliases[compact] || compact;
};
const roleTokens = (value) => normalize(value).replace(/front end/g, 'frontend').replace(/back end/g, 'backend').replace(/\bdeveloper\b/g, 'engineer').split(/\s+/).filter(Boolean);
const city = (value) => {
  const normalized = normalize(value);
  return ({ bangalore: 'bengaluru', delhi: 'new delhi', gurgaon: 'gurugram', 'work from home': 'remote' })[normalized] || normalized;
};
const monthIndex = (value) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value || '')) return null;
  const [year, month] = value.split('-').map(Number);
  return year * 12 + month - 1;
};

// Merge concurrent roles so overlapping dates do not inflate experience.
export function getExperienceYears(experience = [], now = new Date()) {
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const intervals = experience.flatMap((record) => {
    const start = monthIndex(record.startDate);
    const end = record.current ? current : monthIndex(record.endDate);
    return start !== null && end !== null && start <= end && start <= current ? [[start, Math.min(end, current) + 1]] : [];
  }).sort((a, b) => a[0] - b[0]);
  if (!intervals.length) return null;
  const merged = [];
  for (const [start, end] of intervals) {
    const previous = merged.at(-1);
    if (previous && start <= previous[1]) previous[1] = Math.max(previous[1], end);
    else merged.push([start, end]);
  }
  return Math.round(merged.reduce((sum, [start, end]) => sum + end - start, 0) / 12 * 10) / 10;
}

export function getRecommendations(profile = emptyProfile, actions = { saved: [], applied: [] }, { limit = 3, now = new Date() } = {}) {
  const skills = new Set(profile.skills.map(normalizeSkill));
  const roles = profile.preferredRoles.length ? profile.preferredRoles : profile.headline ? [profile.headline.split(/[·|]/)[0]] : [];
  const preferredLocations = profile.preferredLocations.length ? profile.preferredLocations : profile.location ? [profile.location] : [];
  const years = getExperienceYears(profile.experience, now);
  const hasLocation = preferredLocations.length > 0 || !!profile.workMode;
  const hasProfileSignals = skills.size > 0 || roles.length > 0 || hasLocation || years !== null;
  const interests = jobs.filter((job) => actions.saved.includes(job.id) || actions.applied.includes(job.id));
  const activitySkills = new Set(interests.flatMap((job) => job.tags.map(normalizeSkill)));
  const source = hasProfileSignals ? 'profile' : interests.length ? 'activity' : 'starter';
  const recommendations = jobs.filter((job) => !actions.applied.includes(job.id)).map((job) => {
    const evidenceSkills = source === 'profile' ? skills : source === 'activity' ? activitySkills : new Set();
    const matchedSkills = job.tags.filter((tag) => evidenceSkills.has(normalizeSkill(tag)));
    const unmatchedSkills = job.tags.filter((tag) => !evidenceSkills.has(normalizeSkill(tag)));
    const skillRatio = skills.size ? matchedSkills.length / job.tags.length : 0;
    const title = new Set(roleTokens(job.title));
    const roleMatches = roles.map((role) => {
      const tokens = [...new Set(roleTokens(role))];
      return { role, ratio: tokens.length ? tokens.filter((token) => title.has(token)).length / tokens.length : 0 };
    }).sort((a, b) => b.ratio - a.ratio);
    const roleMatch = roleMatches[0];
    const placeMatch = preferredLocations.find((place) => place.split(',').some((part) => city(part) === city(job.location) || (city(part) === 'remote' && job.mode === 'Remote')));
    const modeMatch = !profile.workMode || profile.workMode === job.mode;
    const locationRatio = hasLocation && modeMatch && (!preferredLocations.length || !!placeMatch) ? 1 : 0;
    const [minYears, maxYears] = job.experience.match(/\d+/g).map(Number);
    const experienceRatio = years === null ? 0 : years < minYears ? Math.max(0, years / minYears) : years > maxYears ? 0.7 : 1;
    const factors = [
      { key: 'skills', label: 'Skills', weight: 45, ratio: skillRatio, known: skills.size > 0, explanation: skills.size ? `${matchedSkills.length} of ${job.tags.length} advertised skills in your profile${matchedSkills.length ? `: ${matchedSkills.join(', ')}` : ''}.` : 'Add skills to your profile to score this criterion.' },
      { key: 'role', label: 'Role', weight: 25, ratio: roleMatch?.ratio || 0, known: roles.length > 0, explanation: !roles.length ? 'Add preferred roles or a professional headline.' : roleMatch.ratio === 1 ? `Matches your ${profile.preferredRoles.length ? 'preferred role' : 'headline'}: ${roleMatch.role}.` : roleMatch.ratio > 0 ? `Shares role keywords with ${roleMatch.role}.` : 'Different from the role keywords in your profile.' },
      { key: 'location', label: 'Location', weight: 15, ratio: locationRatio, known: hasLocation, explanation: !hasLocation ? 'Add preferred locations or a work arrangement.' : locationRatio ? `Matches ${placeMatch || profile.workMode}${profile.workMode && placeMatch ? ` and your ${profile.workMode.toLowerCase()} preference` : ''}.` : 'Outside your location or work-arrangement preferences.' },
      { key: 'experience', label: 'Experience', weight: 15, ratio: experienceRatio, known: years !== null, explanation: years === null ? 'Add experience start/end dates to compare experience.' : years < minYears ? `Your estimated ${years} years is below the advertised ${job.experience}.` : years > maxYears ? `Your estimated ${years} years exceeds the advertised ${job.experience}.` : `Your estimated ${years} years fits the advertised ${job.experience}.` },
    ];
    const score = source === 'profile' ? factors.reduce((sum, factor) => sum + Math.round(factor.weight * factor.ratio), 0) : null;
    const activityScore = source === 'activity' ? matchedSkills.length * 3 + Number(interests.some((interest) => interest.location === job.location)) : 0;
    const reason = source === 'profile' ? factors.filter((factor) => factor.known && factor.ratio > 0).map((factor) => factor.explanation).join(' ') || 'No matching profile criteria yet. Consider this an exploration suggestion.' : source === 'activity' ? matchedSkills.length ? `Based on skills in your saved jobs and applications: ${matchedSkills.join(', ')}.` : 'An opportunity to explore beyond your recent activity.' : 'Explore a sample role, or add your profile for personalized matches.';
    return { job, score, source, factors, matchedSkills, unmatchedSkills, reason, activityScore };
  }).sort((a, b) => (b.score ?? b.activityScore) - (a.score ?? a.activityScore) || b.job.postedAt.localeCompare(a.job.postedAt) || a.job.id.localeCompare(b.job.id)).slice(0, Math.max(0, limit));
  return recommendations;
}
