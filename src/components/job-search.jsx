import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { locations } from '@/data/jobs';

const JobSearch = ({ query = '', location = '', preserveFilters = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <form
      role="search"
      aria-label="Search jobs"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams(preserveFilters ? searchParams : undefined);
        const keyword = data.get('q').trim();
        if (keyword) params.set('q', keyword);
        else params.delete('q');
        if (data.get('location')) params.set('location', data.get('location'));
        else params.delete('location');
        navigate(`/jobs${params.size ? `?${params}` : ''}`);
      }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl shadow-black/5 sm:p-4 lg:flex-row lg:items-end"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="job-keyword" className="mb-2 block px-1 text-sm font-medium">What are you looking for?</label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-5 text-muted-foreground" />
          <input id="job-keyword" name="q" type="search" defaultValue={query} placeholder="Job title, company, or skill" className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </div>
      <div className="min-w-0 lg:w-60">
        <label htmlFor="job-location" className="mb-2 block px-1 text-sm font-medium">Where do you want to work?</label>
        <div className="relative">
          <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-5 text-muted-foreground" />
          <select id="job-location" name="location" defaultValue={location} onChange={(event) => { if (preserveFilters) event.currentTarget.form.requestSubmit(); }} className="h-12 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-9 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">All locations</option>
            {locations.map((place) => <option key={place} value={place}>{place}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-4 size-4 text-muted-foreground" />
        </div>
      </div>
      <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <Search aria-hidden="true" className="size-4" /> Browse Jobs
      </button>
    </form>
  );
};
export default JobSearch;
