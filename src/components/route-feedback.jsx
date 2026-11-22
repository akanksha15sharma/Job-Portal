import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { FileSearch } from 'lucide-react';

export const NotFound = () => <section className="mx-auto max-w-2xl px-4 py-16 text-center"><FileSearch aria-hidden="true" className="mx-auto mb-6 size-12 text-muted-foreground" /><p className="text-sm font-medium text-muted-foreground">404 · Page not found</p><h1 className="my-4 text-3xl font-semibold tracking-tight">Let’s get you back on track.</h1><p className="mb-7 leading-7 text-muted-foreground">This page may have moved. Your jobs and applications are still available in your workspace.</p><Link to="/dashboard" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground">Open dashboard</Link></section>;

export const RouteError = () => {
  const error = useRouteError();
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-3xl font-semibold">We couldn’t open this page.</h1><p className="my-5 leading-7 text-muted-foreground">{isRouteErrorResponse(error) && error.status === 404 ? 'The requested page could not be found.' : 'Try again. If a page update interrupted loading, refreshing should help.'}</p><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-lg bg-primary px-5 font-semibold text-primary-foreground">Refresh page</button><a href="/" className="inline-flex min-h-12 items-center rounded-lg border border-border px-5">Return home</a></div></main>;
};
