import { Suspense, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/header';
import ToastNotifications from '@/components/toast-notifications';
import PageSkeleton from '@/components/page-skeleton';

const pageTitles = { '/profile': 'My profile', '/': 'Find your next opportunity', '/dashboard': 'Dashboard', '/jobs': 'Find jobs', '/saved-jobs': 'Saved jobs', '/my-jobs': 'Application tracker', '/onboarding': 'Get started', '/post-job': 'Employer workspace' };
const AppLayout = () => {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);
  useEffect(() => {
    document.title = `${pageTitles[pathname] || (pathname.startsWith('/job/') ? 'Job details' : 'Page not found')} | Job Portal`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  useEffect(() => {
    if (!hash) return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <div className="grid-background" aria-hidden="true" />
    <Header />
    <main id="main-content" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 outline-none"><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></main>
    <footer className="mt-8 border-t border-border bg-card/70"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold"><img src="/logo.svg" width="28" height="28" alt="" className="dark:invert" />Job Portal</Link><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Find your next move. Keep your search organized.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">{[['Find jobs', '/jobs'], ['Dashboard', '/dashboard'], ['Saved jobs', '/saved-jobs'], ['Applications', '/my-jobs'], ['My profile', '/profile']].map(([label, to]) => <Link key={to} to={to} className="inline-flex min-h-11 items-center rounded hover:text-foreground">{label}</Link>)}</nav><p className="max-w-xs text-sm leading-6 text-muted-foreground">Demo frontend · Sample vacancies.<br />Your saved activity stays in this browser.</p></div></footer>
    <ToastNotifications />
  </div>;
};
export default AppLayout;
