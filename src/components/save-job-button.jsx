import { Bookmark } from 'lucide-react';
import { useJobActions } from '@/hooks/use-job-actions';

const SaveJobButton = ({ job }) => {
  const { saved, perform, error } = useJobActions();
  const isSaved = saved.includes(job.id);
  return <div className="ml-auto">
    <button type="button" aria-pressed={isSaved} aria-label={`${isSaved ? 'Unsave' : 'Save'} ${job.title} at ${job.company}`} onClick={() => perform('save', job.id)} className="inline-flex size-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Bookmark aria-hidden="true" className={`size-5 ${isSaved ? 'fill-current' : ''}`} />
    </button>
    {error && <p role="alert" className="mt-2 max-w-40 text-sm text-destructive">{error}</p>}
  </div>;
};
export default SaveJobButton;
