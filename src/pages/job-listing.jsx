import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import JobSearch from '@/components/job-search';
import JobCard from '@/components/job-card';
import { experienceLevels, getJobResults, jobTypes, readJobFilters, salaryRanges, sortOptions } from '@/lib/job-filters';

const JobListing = () => {
  const [params, setParams] = useSearchParams();
  const filters = readJobFilters(params);
  const { query, location } = filters;
  const results = getJobResults(filters);
  const hasFilters = ['q', 'location', 'type', 'experience', 'salary', 'sort'].some((key) => params.has(key));
  const updateFilter = (key, value) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };
  const controls = [
    { key: 'type', label: 'Job type', placeholder: 'All job types', options: jobTypes.map((value) => ({ value, label: value })) },
    { key: 'experience', label: 'Experience level', placeholder: 'All experience levels', options: experienceLevels },
    { key: 'salary', label: 'Salary range', placeholder: 'Any salary', options: salaryRanges },
    { key: 'sort', label: 'Sort jobs', options: sortOptions },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="jobs-heading">
      <h1 id="jobs-heading" className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next opportunity</h1>
      <p className="mb-8 text-muted-foreground">Explore sample roles by title, company, skill, or location.</p>
      <JobSearch key={`${query}:${location}`} query={query} location={location} preserveFilters />
      <section aria-labelledby="filter-heading" className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="filter-heading" className="flex items-center gap-2 font-semibold"><SlidersHorizontal aria-hidden="true" className="size-4" />Refine your search</h2>
          <button type="button" onClick={() => setParams({})} disabled={!hasFilters} className="min-h-10 rounded-lg px-3 text-sm font-medium underline underline-offset-4 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline">Clear filters</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {controls.map(({ key, label, placeholder, options }) => (
            <div key={key}>
              <label htmlFor={`filter-${key}`} className="mb-2 block text-sm font-medium">{label}</label>
              <div className="relative">
                <select id={`filter-${key}`} value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} aria-describedby={key === 'salary' || key === 'sort' ? 'salary-help' : undefined} className="h-12 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-9 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {placeholder && <option value="">{placeholder}</option>}
                  {options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-4 size-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
        <p id="salary-help" className="mt-4 text-sm leading-6 text-muted-foreground">Salaries are in lakhs per year (LPA). Matches include overlapping salary ranges; salary sorting uses the highest advertised pay. Filters apply immediately; use Browse Jobs to submit keyword and location changes.</p>
      </section>
      <div className="my-7 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-muted-foreground">{results.length} sample {results.length === 1 ? 'job' : 'jobs'}{query && ` matching “${query}”`}{location && ` in ${location}`}</p>
      </div>
      {results.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{results.map((job) => <JobCard key={job.id} job={job} />)}</div> : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Search aria-hidden="true" className="mx-auto mb-4 size-8 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No matching jobs</h2><p className="mt-2 px-4 text-muted-foreground">Try another keyword, location, or a broader set of filters.</p>
          <Link to="/jobs" className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/80">Browse all jobs</Link>
        </div>
      )}
      <p className="mt-6 text-sm text-muted-foreground">Illustrative listings only. These are not live vacancies.</p>
    </section>
  );
};
export default JobListing;
