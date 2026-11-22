import { Link } from 'react-router-dom';

const colors = ['var(--foreground)', 'var(--muted-foreground)', 'var(--ring)', 'var(--border)'];
const DashboardCharts = ({ counts, trend, total }) => {
  let offset = 0;
  const segments = Object.entries(counts).map(([status, count], index) => {
    const start = offset;
    offset += total ? count / total * 100 : 0;
    return { status, count, color: colors[index], start, end: offset };
  });
  const gradient = total ? `conic-gradient(${segments.map(({ color, start, end }) => `${color} ${start}% ${end}%`).join(', ')})` : 'var(--secondary)';
  const max = Math.max(1, ...trend.map(({ count }) => count));
  return <div className="grid gap-6 lg:grid-cols-2">
    <section aria-labelledby="status-chart-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 id="status-chart-heading" className="text-xl font-semibold">Application status</h2><p className="mt-2 text-sm text-muted-foreground">Your current pipeline at a glance.</p><div className="mt-6 flex flex-col items-center gap-6 sm:flex-row"><div aria-hidden="true" className="flex size-40 shrink-0 items-center justify-center rounded-full" style={{ background: gradient }}><div className="flex size-28 flex-col items-center justify-center rounded-full bg-card"><span className="text-3xl font-semibold">{total}</span><span className="text-sm text-muted-foreground">applications</span></div></div><ul aria-label="Application status counts" className="w-full space-y-2">{segments.map(({ status, count, color }) => <li key={status}><Link to={`/my-jobs?status=${status}`} className="flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-2 text-sm"><span aria-hidden="true" className="size-3 rounded-sm border border-border" style={{ background: color }} />{status}</span><span className="text-sm font-semibold">{count}<span className="ml-2 font-normal text-muted-foreground">{total ? Math.round(count / total * 100) : 0}%</span></span></Link></li>)}</ul></div>{!total && <p className="mt-4 text-sm text-muted-foreground">Apply to a sample job to start building your pipeline.</p>}</section>
    <section aria-labelledby="activity-chart-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 id="activity-chart-heading" className="text-xl font-semibold">Application activity</h2><p className="mt-2 text-sm text-muted-foreground">Applications recorded over the last six months.</p><ul aria-label="Monthly application counts" className="mt-6 space-y-3">{trend.map(({ key, label, count }) => <li key={key} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm"><span className="text-muted-foreground">{label}</span><span aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${count / max * 100}%` }} /></span><span className="text-right font-semibold"><span className="sr-only">Applications: </span>{count}</span></li>)}</ul><p className="mt-5 text-sm text-muted-foreground">Older applications without a recorded date are excluded from this chart.</p></section>
  </div>;
};
export default DashboardCharts;
