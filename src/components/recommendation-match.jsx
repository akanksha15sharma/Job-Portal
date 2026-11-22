import { Check, CircleDashed } from 'lucide-react';

const RecommendationMatch = ({ match }) => <div className="mb-5 space-y-4">
  <div className="rounded-xl border border-border bg-secondary/40 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{match.score === null ? match.source === 'activity' ? 'Based on your activity' : 'Worth exploring' : `${match.score}% profile match`}</p>{match.score !== null && <span className="text-sm text-muted-foreground">{match.factors.filter((factor) => factor.known).length}/4 criteria available</span>}</div>
    {match.score !== null && <progress aria-label={`${match.job.title} profile match`} max={100} value={match.score} className="mt-3 h-2 w-full" />}
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{match.reason}</p>
  </div>
  <div><p className="mb-2 text-sm font-medium">{match.source === 'activity' ? 'Skills seen in your job activity' : match.source === 'starter' || !match.factors[0].known ? 'Advertised skills · add yours to compare' : `${match.matchedSkills.length}/${match.job.tags.length} skills matched`}</p><ul aria-label={`Skill comparison for ${match.job.title}`} className="flex flex-wrap gap-2">{match.job.tags.map((tag) => {
    const matched = match.matchedSkills.includes(tag);
    return <li key={tag} className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-sm ${matched ? 'border-ring bg-secondary font-medium' : 'border-border text-muted-foreground'}`}>{matched ? <Check aria-hidden="true" className="size-3.5 shrink-0" /> : <CircleDashed aria-hidden="true" className="size-3.5 shrink-0" />}<span className="break-words">{tag}</span><span className="sr-only">{matched ? match.source === 'activity' ? ': found in your job activity' : ': matched in your profile' : ': not found in your profile'}</span></li>;
  })}</ul></div>
  {match.source === 'profile' && <details className="rounded-lg border border-border px-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Why this match?</summary><ul className="space-y-3 pb-4 text-sm leading-6">{match.factors.map((factor) => <li key={factor.key}><p className="font-medium">{factor.label}: {factor.known ? `${Math.round(factor.ratio * factor.weight)}/${factor.weight} points` : 'not provided'}</p><p className="text-muted-foreground">{factor.explanation}</p></li>)}</ul></details>}
</div>;
export default RecommendationMatch;
