import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import JobSearch from '@/components/job-search';
import JobCard from '@/components/job-card';
import { filterJobs } from '@/data/jobs';

const JobListing = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const location = params.get('location') || '';
  const results = filterJobs(query, location);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="jobs-heading">
      <h1 id="jobs-heading" className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next opportunity</h1>
      <p className="mb-8 text-muted-foreground">Explore sample roles by title, company, skill, or location.</p>
      <JobSearch key={params.toString()} query={query} location={location} />
      <div className="my-7 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-muted-foreground">{results.length} sample {results.length === 1 ? 'job' : 'jobs'}{query && ` matching “${query}”`}{location && ` in ${location}`}</p>
        {(query || location) && <Link to="/jobs" className="rounded text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</Link>}
      </div>
      {results.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{results.map((job) => <JobCard key={job.id} job={job} />)}</div> : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Search aria-hidden="true" className="mx-auto mb-4 size-8 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No matching jobs</h2><p className="mt-2 px-4 text-muted-foreground">Try a different keyword or choose another location.</p>
          <Link to="/jobs" className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/80">Browse all jobs</Link>
        </div>
      )}
      <p className="mt-6 text-sm text-muted-foreground">Illustrative listings only. These are not live vacancies.</p>
    </section>
  );
};
export default JobListing;
