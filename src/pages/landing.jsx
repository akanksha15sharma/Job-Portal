import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Globe2, SlidersHorizontal } from 'lucide-react';
import JobSearch from '@/components/job-search';
import JobCard from '@/components/job-card';
import { jobs } from '@/data/jobs';

const LandingPage = () => (
  <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden rounded-3xl border border-border bg-card/80 px-5 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 -z-10 size-96 rounded-full bg-foreground/5 blur-3xl" />
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"><BriefcaseBusiness aria-hidden="true" className="size-4" /> Your next chapter starts here</p>
      <h1 id="hero-heading" className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Find work that brings<br className="hidden sm:block" /> out your best.</h1>
      <p className="mb-9 mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">A fresh start. A bigger challenge. A team that gets you. Discover roles that fit your skills and the way you want to work.</p>
      <JobSearch />
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 text-muted-foreground">Popular searches:</span>
        {['React', 'Design', 'Data', 'Remote'].map((term) => <Link key={term} to={`/jobs?q=${encodeURIComponent(term)}`} className="rounded-full border border-border bg-background/70 px-3 py-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{term}</Link>)}
      </div>
    </section>

    <section aria-label="A better way to find work" className="grid gap-6 border-b border-border py-9 sm:grid-cols-3 sm:gap-8">
      {[
        { icon: BriefcaseBusiness, title: 'Find your next move', text: 'Explore roles across engineering, design, data, and more.' },
        { icon: Globe2, title: 'Work your way', text: 'Discover remote opportunities and teams closer to home.' },
        { icon: SlidersHorizontal, title: 'Focus on what fits', text: 'Search by your skills and narrow down by location.' },
      ].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary"><Icon aria-hidden="true" className="size-5" /></span><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}
    </section>

    <section aria-labelledby="featured-heading" className="py-10 sm:py-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">Explore opportunities</p><h2 id="featured-heading" className="text-3xl font-semibold tracking-tight">Find your next great fit</h2><p className="mt-3 text-muted-foreground">Featured sample jobs to help you explore what’s possible.</p></div>
        <Link to="/jobs" className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View all jobs</Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">Demo listings · Companies, roles, and salary ranges are illustrative. These are not live vacancies.</p>
    </section>

    <section aria-labelledby="remote-heading" className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-secondary/50 p-6 sm:p-9 md:flex-row md:items-center">
      <div><p className="mb-2 text-sm text-muted-foreground">A little more flexibility</p><h2 id="remote-heading" className="text-2xl font-semibold tracking-tight">Your next role could be anywhere.</h2><p className="mt-2 text-muted-foreground">Explore sample remote roles and find work that fits your life.</p></div>
      <Link to="/jobs?location=Remote" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore remote jobs</Link>
    </section>
  </div>
);
export default LandingPage;
