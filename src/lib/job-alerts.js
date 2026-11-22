import { jobs } from '../data/jobs.js';
import { experienceLevels, jobTypes } from './job-filters.js';
import { normalizeSkill } from './recommendations.js';

export const alertStorageKey = 'job-portal-alerts';
export const emptyAlert = { name: '', title: '', skills: [], location: '', salaryMin: '', salaryMax: '', type: '', experience: '', enabled: true };
const text = (value, max = 120) => typeof value === 'string' ? value.slice(0, max).trim() : '';
const date = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
const uniqueStrings = (value) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))] : [];
export function normalizeAlert(value = {}) {
  return { ...emptyAlert, name: text(value.name, 80), title: text(value.title), skills: uniqueStrings(value.skills).map((skill) => skill.slice(0, 80)).slice(0, 30), location: text(value.location), salaryMin: text(value.salaryMin, 20), salaryMax: text(value.salaryMax, 20), type: jobTypes.includes(value.type) ? value.type : '', experience: experienceLevels.some(({ value: level }) => level === value.experience) ? value.experience : '', enabled: value.enabled !== false };
}
export function validateAlert(alert) {
  const errors = {};
  if (!alert.name.trim()) errors.name = 'Give this alert a name.';
  if (alert.name.length > 80) errors.name = 'Keep the alert name to 80 characters or fewer.';
  if (alert.skills.some((skill) => skill.length > 80) || alert.skills.length > 30) errors.skills = 'Use up to 30 skills, with at most 80 characters each.';
  for (const key of ['salaryMin', 'salaryMax']) if (alert[key] && (!Number.isFinite(Number(alert[key])) || Number(alert[key]) < 0 || Number(alert[key]) > 1000)) errors[key] = 'Enter an annual salary from 0 to 1000 LPA.';
  if (alert.salaryMin && alert.salaryMax && Number(alert.salaryMin) > Number(alert.salaryMax)) errors.salaryMax = 'Maximum salary must be at least the minimum.';
  return errors;
}
export function parseAlertState(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  const alerts = new Map();
  for (const item of Array.isArray(data?.alerts) ? data.alerts : []) {
    if (!item || typeof item.id !== 'string' || !/^[\w-]{1,100}$/.test(item.id) || alerts.has(item.id)) continue;
    const alert = normalizeAlert(item);
    if (Object.keys(validateAlert(alert)).length || alerts.size >= 20) continue;
    alerts.set(item.id, { ...alert, id: item.id, createdAt: date(item.createdAt), updatedAt: date(item.updatedAt) });
  }
  const notifications = new Map();
  for (const item of Array.isArray(data?.notifications) ? data.notifications : []) {
    if (!item || typeof item.jobId !== 'string' || !/^[\w-]{1,100}$/.test(item.jobId)) continue;
    const id = `job:${item.jobId}`;
    const previous = notifications.get(id);
    notifications.set(id, { id, jobId: item.jobId, alertIds: [...new Set([...(previous?.alertIds || []), ...uniqueStrings(item.alertIds)])], alertNames: [...new Set([...(previous?.alertNames || []), ...uniqueStrings(item.alertNames).map((name) => name.slice(0, 80))])], createdAt: previous?.createdAt || date(item.createdAt), readAt: previous?.readAt || date(item.readAt) });
  }
  return { alerts: [...alerts.values()], notifications: [...notifications.values()] };
}
export function getAlertMatches(alert, catalog = jobs) {
  const titleTerms = alert.title.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const requiredSkills = alert.skills.map(normalizeSkill);
  return catalog.filter((job) => {
    const advertisedSkills = new Set(job.tags.map(normalizeSkill));
    return titleTerms.every((term) => job.title.toLowerCase().includes(term))
      && requiredSkills.every((skill) => advertisedSkills.has(skill))
      && (!alert.location || job.location.toLowerCase() === alert.location.toLowerCase())
      && (!alert.type || job.type === alert.type)
      && (!alert.experience || job.experienceLevel === alert.experience)
      && (!alert.salaryMin || job.salaryMax >= Number(alert.salaryMin))
      && (!alert.salaryMax || job.salaryMin <= Number(alert.salaryMax));
  });
}
export function reconcileAlertMatches(state, catalog = jobs, now = new Date().toISOString()) {
  const notifications = new Map(state.notifications.map((item) => [item.id, { ...item, alertIds: [...item.alertIds], alertNames: [...item.alertNames] }]));
  for (const alert of state.alerts.filter((item) => item.enabled)) for (const job of getAlertMatches(alert, catalog)) {
    const id = `job:${job.id}`;
    const previous = notifications.get(id);
    notifications.set(id, previous ? { ...previous, alertIds: [...new Set([...previous.alertIds, alert.id])], alertNames: [...new Set([...previous.alertNames, alert.name])] } : { id, jobId: job.id, alertIds: [alert.id], alertNames: [alert.name], createdAt: now, readAt: null });
  }
  return { ...state, notifications: [...notifications.values()].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || a.id.localeCompare(b.id)) };
}
export function updateAlertState(state, action, payload = {}, now = new Date().toISOString()) {
  if (action === 'save') {
    const alert = normalizeAlert(payload.alert);
    const errors = validateAlert(alert);
    if (typeof payload.alert?.name === 'string' && payload.alert.name.length > 80) errors.name = 'Keep the alert name to 80 characters or fewer.';
    if (Array.isArray(payload.alert?.skills) && (payload.alert.skills.length > 30 || payload.alert.skills.some((skill) => typeof skill !== 'string' || skill.length > 80))) errors.skills = 'Use up to 30 skills, with at most 80 characters each.';
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const current = state.alerts.find((item) => item.id === payload.id);
    if (payload.edit && !current) throw new Error('This alert was deleted in another tab. Create a new alert instead.');
    if (current && payload.expectedUpdatedAt !== current.updatedAt) throw new Error('This alert changed in another tab. Cancel and reopen it to edit the latest version.');
    if (!current && state.alerts.length >= 20) throw new Error('You can save up to 20 alerts. Delete an unused alert first.');
    if (!/^[\w-]{1,100}$/.test(payload.id || '')) throw new Error('Could not create this alert. Please try again.');
    const next = { ...alert, id: payload.id, createdAt: current?.createdAt || now, updatedAt: now };
    return { ...state, alerts: current ? state.alerts.map((item) => item.id === payload.id ? next : item) : [...state.alerts, next] };
  }
  if (action === 'delete') return { ...state, alerts: state.alerts.filter((item) => item.id !== payload.id) };
  if (action === 'toggle') return { ...state, alerts: state.alerts.map((item) => item.id === payload.id ? { ...item, enabled: !item.enabled, updatedAt: now } : item) };
  if (action === 'read') return { ...state, notifications: state.notifications.map((item) => item.id === payload.id ? { ...item, readAt: item.readAt || now } : item) };
  if (action === 'read-all') return { ...state, notifications: state.notifications.map((item) => ({ ...item, readAt: item.readAt || now })) };
  if (action === 'unread') return { ...state, notifications: state.notifications.map((item) => item.id === payload.id ? { ...item, readAt: null } : item) };
  return state;
}
