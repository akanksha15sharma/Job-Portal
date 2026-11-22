export const profileStorageKey = 'job-portal-profile';
export const maxResumeBytes = 1024 * 1024;
export const emptyProfile = {
  fullName: '', email: '', phone: '', location: '', website: '', headline: '', bio: '',
  skills: [], education: [], experience: [], projects: [], preferredRoles: [], preferredLocations: [],
  salaryMin: '', salaryMax: '', workMode: '', resume: null, updatedAt: null,
};
export const recordFields = {
  education: ['id', 'institution', 'degree', 'startDate', 'endDate'],
  experience: ['id', 'title', 'company', 'location', 'startDate', 'endDate', 'description'],
  projects: ['id', 'name', 'url', 'description'],
};
export const splitProfileTags = (value) => [...new Set(value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean))].slice(0, 30);
const text = (value, max = 200) => typeof value === 'string' ? value.slice(0, max) : '';
const tags = (value) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim().slice(0, 80)).filter(Boolean))].slice(0, 30) : [];
export function isValidResume(resume) {
  return !!resume && typeof resume.name === 'string' && /\.pdf$/i.test(resume.name) && Number.isInteger(resume.size) && resume.size > 0 && resume.size <= maxResumeBytes
    && typeof resume.data === 'string' && /^data:application\/pdf;base64,JVBERi0[A-Za-z0-9+/]*={0,2}$/.test(resume.data) && resume.data.length <= Math.ceil(maxResumeBytes / 3) * 4 + 40;
}
export function parseProfile(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  const profile = { ...emptyProfile };
  for (const key of ['fullName', 'email', 'phone', 'location', 'website', 'headline', 'bio', 'salaryMin', 'salaryMax', 'workMode']) profile[key] = text(data?.[key], key === 'bio' ? 2000 : 200);
  for (const key of ['skills', 'preferredRoles', 'preferredLocations']) profile[key] = tags(data?.[key]);
  for (const [key, fields] of Object.entries(recordFields)) profile[key] = Array.isArray(data?.[key]) ? data[key].filter((item) => item && typeof item === 'object').slice(0, 20).map((item, index) => ({
    ...Object.fromEntries(fields.map((field) => [field, text(item[field], field === 'description' ? 2000 : 200)])),
    id: `${key}-${index}`,
    ...(key === 'experience' ? { current: item.current === true } : {}),
  })) : [];
  profile.resume = isValidResume(data?.resume) ? { name: text(data.resume.name), size: data.resume.size, data: data.resume.data } : null;
  profile.workMode = ['Remote', 'Hybrid', 'On-site'].includes(profile.workMode) ? profile.workMode : '';
  profile.updatedAt = typeof data?.updatedAt === 'string' && Number.isFinite(Date.parse(data.updatedAt)) ? data.updatedAt : null;
  return profile;
}
const validUrl = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
export const safeProfileUrl = (value) => validUrl(value) ? value : null;
export function validateProfile(profile) {
  const errors = {};
  for (const key of ['skills', 'preferredRoles', 'preferredLocations']) if (profile[key].some((value) => value.length > 80)) errors[key] = 'Keep each tag to 80 characters or fewer.';
  if (!profile.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errors.email = 'Enter a valid email address.';
  if (profile.phone && (!/^[+\d\s()-]+$/.test(profile.phone) || profile.phone.replace(/\D/g, '').length < 7 || profile.phone.replace(/\D/g, '').length > 15)) errors.phone = 'Enter a phone number with 7–15 digits.';
  if (profile.website && !validUrl(profile.website)) errors.website = 'Use a full http:// or https:// URL.';
  for (const key of ['salaryMin', 'salaryMax']) if (profile[key] && (!Number.isFinite(Number(profile[key])) || Number(profile[key]) < 0 || Number(profile[key]) > 1000)) errors[key] = 'Enter an annual amount from 0 to 1000 LPA.';
  if (profile.salaryMin && profile.salaryMax && Number(profile.salaryMin) > Number(profile.salaryMax)) errors.salaryMax = 'Maximum salary must be at least the minimum salary.';
  for (const key of ['education', 'experience', 'projects']) profile[key].forEach((record, index) => {
    const required = key === 'education' ? ['institution', 'degree'] : key === 'experience' ? ['title', 'company'] : ['name'];
    for (const field of required) if (!record[field].trim()) errors[`${key}.${index}.${field}`] = 'This field is required. Remove the entry if you do not need it.';
    if (key !== 'projects') {
      for (const field of ['startDate', 'endDate']) if (record[field] && !/^\d{4}-(0[1-9]|1[0-2])$/.test(record[field])) errors[`${key}.${index}.${field}`] = 'Choose a valid month and year.';
      if (!record.current && record.startDate && record.endDate && record.startDate > record.endDate) errors[`${key}.${index}.endDate`] = 'End date must be after the start date.';
    }
    if (key === 'projects' && record.url && !validUrl(record.url)) errors[`${key}.${index}.url`] = 'Use a full http:// or https:// URL.';
  });
  if (profile.resume && !isValidResume(profile.resume)) errors.resume = 'Choose a valid PDF up to 1 MB.';
  return errors;
}
export function getProfileCompletion(profile) {
  const sections = [
    { id: 'personal', label: 'Personal details', complete: !!profile.fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) && !!profile.location.trim() },
    { id: 'about', label: 'Professional headline and bio', complete: !!profile.headline.trim() && !!profile.bio.trim() },
    { id: 'skills', label: 'Skills', complete: profile.skills.length > 0 },
    { id: 'education', label: 'Education', complete: profile.education.some((item) => item.institution.trim() && item.degree.trim()) },
    { id: 'experience', label: 'Experience or projects', complete: profile.experience.some((item) => item.title.trim() && item.company.trim()) || profile.projects.some((item) => item.name.trim()) },
    { id: 'preferences', label: 'Job and salary preferences', complete: profile.preferredRoles.length > 0 && profile.preferredLocations.length > 0 && (profile.salaryMin !== '' || profile.salaryMax !== '') },
    { id: 'resume', label: 'PDF résumé', complete: isValidResume(profile.resume) },
  ];
  return { sections, percent: Math.round(sections.filter((section) => section.complete).length / sections.length * 100) };
}
export async function readResumeFile(file) {
  if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf') || !file.size || file.size > maxResumeBytes) throw new Error('Choose a PDF file up to 1 MB.');
  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (signature !== '%PDF-') throw new Error('This file does not appear to be a PDF. Choose a valid PDF document.');
  const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read this PDF. Please try again.')); reader.onabort = () => reject(new Error('PDF upload was cancelled.')); reader.readAsDataURL(file); });
  const resume = { name: file.name, size: file.size, data: data.replace(/^data:[^;]*;/, 'data:application/pdf;') };
  if (!isValidResume(resume)) throw new Error('Could not read this PDF. Choose a valid PDF up to 1 MB.');
  return resume;
}
