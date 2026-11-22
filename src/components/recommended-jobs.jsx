import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useJobActions } from '@/hooks/use-job-actions';
import { getRecommendations } from '@/lib/recommendations';
import JobCard from '@/components/job-card';

const RecommendedJobs = ({ id }) => {
  const { profile } = useProfile();
  const actions = useJobActions();
  const headingRef = useRef(null);
  const recommendations = getRecommendations(profile, actions);
  const source = recommendations[0]?.source;
  const noMatches = source === 'profile' && recommendations.every((item) => item.score === 0);
  return <section id={id} aria-labelledby={`${id}-heading`}>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="max-w-2xl"><p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Sparkles aria-hidden="true" className="size-4" />Your next opportunity</p><h2 id={`${id}-heading`} ref={headingRef} tabIndex={-1} className="rounded text-2xl font-semibold tracking-tight sm:text-3xl">{noMatches ? 'Explore beyond your current preferences' : source === 'profile' ? 'Recommended for your profile' : source === 'activity' ? 'Inspired by your job activity' : 'Discover your next great fit'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{noMatches ? 'None of the remaining sample jobs match your available profile criteria. Try broader preferences, or explore these alternatives.' : source === 'profile' ? 'Ranked by your skills, preferred roles, location, and dated experience. Jobs you’ve already applied to are excluded.' : source === 'activity' ? 'Suggestions use skills and locations in jobs you saved or applied to. Add a profile for personal match scores.' : 'Start with these sample roles. Add your profile to get recommendations with explained match scores.'}</p></div><div className="flex flex-wrap gap-3"><Link to="/profile" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent">{source === 'profile' ? 'Refine your profile' : 'Personalize matches'}</Link><Link to="/jobs" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent">Browse all jobs</Link></div></div>
    {recommendations.length ? <><div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">{recommendations.map((match) => <JobCard key={match.job.id} job={match.job} match={match} onApply={() => { if (actions.perform('apply', match.job.id)) requestAnimationFrame(() => headingRef.current?.focus()); }} />)}</div><details className="mt-5 rounded-xl border border-border bg-card px-4"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">How recommendations work</summary><p className="pb-4 text-sm leading-7 text-muted-foreground">Profile scores use advertised skills (45 points), role keyword overlap (25), location and work arrangement (15), and experience ranges (15). Missing profile criteria earn no points; experience uses dated roles with overlaps counted once. Preferred roles and locations take precedence over your headline and current location. Skills use a small set of common aliases such as JS/JavaScript. Scores describe sample-job alignment, not a hiring probability. Save keeps a job in your shortlist. Apply Now records a local demo application and removes the job from recommendations.</p></details><p className="mt-4 text-sm leading-6 text-muted-foreground">Sample vacancies only · No application is sent to an employer. Profile changes and job actions update across pages and browser tabs.</p></> : <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"><h3 className="text-xl font-semibold">You’ve explored every sample opportunity</h3><p className="mt-3 leading-7 text-muted-foreground">All sample roles are already in your application tracker. Review your next steps or browse the full sample catalog.</p><Link to="/my-jobs" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground">Open application tracker</Link></div>}
    {actions.error && <p role="alert" className="mt-4 text-sm text-destructive">{actions.error}</p>}
  </section>;
};
export default RecommendedJobs;
