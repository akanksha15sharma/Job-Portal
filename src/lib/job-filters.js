import { filterJobs, locations } from '../data/jobs.js';

export const jobTypes = ['Full-time', 'Contract'];
export const experienceLevels = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
];
export const salaryRanges = [
  { value: 'under-10', label: 'Below ₹10 LPA', min: 0, max: 10 },
  { value: '10-15', label: '₹10–15 LPA', min: 10, max: 15 },
  { value: '15-20', label: '₹15–20 LPA', min: 15, max: 20 },
  { value: '20-plus', label: '₹20+ LPA', min: 20, max: Infinity },
];
export const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salary-desc', label: 'Salary: high to low' },
  { value: 'salary-asc', label: 'Salary: low to high' },
];

export function readJobFilters(params) {
  return {
    query: params.get('q') || '',
    location: locations.includes(params.get('location')) ? params.get('location') : '',
    type: jobTypes.includes(params.get('type')) ? params.get('type') : '',
    experience: experienceLevels.some(({ value }) => value === params.get('experience')) ? params.get('experience') : '',
    salary: salaryRanges.some(({ value }) => value === params.get('salary')) ? params.get('salary') : '',
    sort: sortOptions.some(({ value }) => value === params.get('sort')) ? params.get('sort') : 'newest',
  };
}

export function getJobResults(filters) {
  const range = salaryRanges.find(({ value }) => value === filters.salary);
  return filterJobs(filters.query, filters.location)
    .filter((job) => (!filters.type || job.type === filters.type)
      && (!filters.experience || job.experienceLevel === filters.experience)
      && (!range || (job.salaryMax >= range.min && job.salaryMin < range.max)))
    .sort((a, b) => {
      // Salary sorting uses the advertised upper bound, then the lower bound.
      const salaryDifference = a.salaryMax - b.salaryMax || a.salaryMin - b.salaryMin;
      if (filters.sort === 'salary-asc') return salaryDifference || a.id.localeCompare(b.id);
      if (filters.sort === 'salary-desc') return -salaryDifference || a.id.localeCompare(b.id);
      return b.postedAt.localeCompare(a.postedAt) || a.id.localeCompare(b.id);
    });
}
