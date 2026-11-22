// Illustrative listings for the demo; these are not live vacancies.
const sampleJobs = [
  { salaryMin: 12, salaryMax: 18, experienceLevel: 'mid', postedAt: '2026-11-18', id: 'frontend-engineer', title: 'Frontend Engineer', company: 'Northstar Labs', initials: 'NL', location: 'Bengaluru', mode: 'Hybrid', type: 'Full-time', salary: '₹12–18 LPA', experience: '2–4 years', tags: ['React', 'TypeScript', 'Tailwind CSS'], description: 'Build thoughtful, accessible interfaces for a growing team collaboration platform.', responsibilities: ['Build responsive interfaces with React and TypeScript.', 'Collaborate with designers to improve usability and accessibility.', 'Write maintainable code and review changes with your team.'] },
  { salaryMin: 10, salaryMax: 16, experienceLevel: 'mid', postedAt: '2026-11-20', id: 'product-designer', title: 'Product Designer', company: 'Forma Studio', initials: 'FS', location: 'Remote', mode: 'Remote', type: 'Full-time', salary: '₹10–16 LPA', experience: '2–5 years', tags: ['Figma', 'UX research', 'Design systems'], description: 'Turn complex workflows into clear, intuitive experiences for small businesses.', responsibilities: ['Explore customer needs through research and prototypes.', 'Create accessible flows and polished interface designs.', 'Partner with engineers to maintain a shared design system.'] },
  { salaryMin: 15, salaryMax: 22, experienceLevel: 'senior', postedAt: '2026-11-16', id: 'backend-developer', title: 'Backend Developer', company: 'Cloudlane', initials: 'CL', location: 'Hyderabad', mode: 'Hybrid', type: 'Full-time', salary: '₹15–22 LPA', experience: '5–7 years', tags: ['Node.js', 'PostgreSQL', 'AWS'], description: 'Design reliable APIs and services that help businesses manage their operations.', responsibilities: ['Develop secure APIs and database models.', 'Improve service performance and observability.', 'Work with frontend engineers to deliver complete features.'] },
  { salaryMin: 8, salaryMax: 13, experienceLevel: 'junior', postedAt: '2026-11-21', id: 'data-analyst', title: 'Data Analyst', company: 'Metric Works', initials: 'MW', location: 'Mumbai', mode: 'On-site', type: 'Full-time', salary: '₹8–13 LPA', experience: '1–3 years', tags: ['SQL', 'Python', 'Power BI'], description: 'Help product teams make better decisions through clear analysis and useful dashboards.', responsibilities: ['Analyze product and business data using SQL.', 'Create dashboards that communicate useful insights.', 'Work with stakeholders to define reliable metrics.'] },
  { salaryMin: 9, salaryMax: 14, experienceLevel: 'mid', postedAt: '2026-11-19', id: 'react-developer', title: 'React Developer', company: 'Brightpath', initials: 'BP', location: 'Pune', mode: 'Hybrid', type: 'Contract', salary: '₹9–14 LPA', experience: '2–4 years', tags: ['React', 'JavaScript', 'REST APIs'], description: 'Create fast, approachable web experiences for an online learning platform.', responsibilities: ['Implement reusable React components.', 'Integrate APIs and handle loading and error states.', 'Improve performance across mobile and desktop devices.'] },
  { salaryMin: 6, salaryMax: 10, experienceLevel: 'junior', postedAt: '2026-11-17', id: 'marketing-specialist', title: 'Marketing Specialist', company: 'Bloom Collective', initials: 'BC', location: 'New Delhi', mode: 'Hybrid', type: 'Full-time', salary: '₹6–10 LPA', experience: '1–3 years', tags: ['Content', 'SEO', 'Analytics'], description: 'Grow a community of independent businesses through thoughtful content and campaigns.', responsibilities: ['Plan content and digital campaigns.', 'Measure campaign performance and share learnings.', 'Collaborate with creative teams on brand storytelling.'] },
];

const companyProfiles = {
  'Northstar Labs': 'A product team building collaboration tools for distributed businesses.',
  'Forma Studio': 'A design-led studio helping small businesses simplify their daily work.',
  'Cloudlane': 'A software company creating reliable cloud tools for business operations.',
  'Metric Works': 'An analytics team turning business data into clear, actionable insights.',
  'Brightpath': 'An education technology team making online learning more accessible.',
  'Bloom Collective': 'A creative team supporting independent businesses through digital storytelling.',
};

export const jobs = sampleJobs.map((job) => ({
  ...job,
  companyDescription: companyProfiles[job.company],
  requirements: [
    `${job.experience} of relevant professional experience.`,
    `Practical experience with ${job.tags.join(', ')}.`,
    'Clear communication and a collaborative approach to solving problems.',
  ],
  benefits: job.type === 'Contract'
    ? ['Flexible working hours', 'A dedicated project mentor', 'Access to learning resources']
    : ['Health and wellness support', 'Paid leave and company holidays', 'Learning and professional development budget', ...(job.mode === 'Remote' ? ['Remote work equipment support'] : ['Flexible team working arrangements'])],
}));

export const locations = [...new Set(jobs.map((job) => job.location))].sort();

export function filterJobs(query = '', location = '') {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return jobs.filter((job) => {
    const searchable = [job.title, job.company, job.location, job.mode, job.type, ...job.tags].join(' ').toLowerCase();
    return terms.every((term) => searchable.includes(term)) && (!location || job.location === location);
  });
}
