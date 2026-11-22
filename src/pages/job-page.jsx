import { Link, useParams } from 'react-router-dom';
import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { jobs } from '@/data/jobs';

const JobPage = () => {
  const { id } = useParams();
  const job = jobs.find((item) => item.id === id);
  if (!job) return <section className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-3xl font-semibold">Job not found</h1><p className="my-4 text-muted-foreground">This listing is not available. Explore the other sample opportunities.</p><Link to="/jobs" className="underline underline-offset-4">Browse jobs</Link></section>;
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6" aria-labelledby="job-heading">
      <Link to="/jobs" className="mb-6 inline-block rounded text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Back to all jobs</Link>
      <article className="rounded-2xl border border-border bg-card p-6 sm:p-10">
        <p className="mb-5 text-sm font-medium text-muted-foreground">Sample opportunity</p>
        <p className="mb-2 font-medium">{job.company}</p><h1 id="job-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h1>
        <div className="my-5 flex flex-wrap gap-4 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="size-4" />{job.location} · {job.mode}</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness aria-hidden="true" className="size-4" />{job.type}</span></div>
        <p className="font-semibold">{job.salary} <span className="font-normal text-muted-foreground">· {job.experience} experience</span></p>
        <h2 className="mb-3 mt-8 text-xl font-semibold">About the role</h2><p className="leading-7 text-muted-foreground">{job.description}</p>
        <h2 className="mb-3 mt-8 text-xl font-semibold">What you’ll do</h2><ul className="list-disc space-y-3 pl-5 leading-7 text-muted-foreground">{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2 className="mb-3 mt-8 text-xl font-semibold">Skills</h2><ul className="flex flex-wrap gap-2">{job.tags.map((tag) => <li key={tag} className="rounded-md bg-secondary px-3 py-1.5 text-sm">{tag}</li>)}</ul>
        <p className="mt-9 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">This is an illustrative listing from a fictional company. Applications are not available for sample jobs.</p>
      </article>
    </section>
  );
};
export default JobPage;
