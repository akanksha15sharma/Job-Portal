import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { JobAlertsContext } from '@/hooks/use-job-alerts';
import { alertStorageKey, parseAlertState, reconcileAlertMatches, updateAlertState } from '@/lib/job-alerts';
import { notify } from '@/lib/notifications';
const changeEvent = 'job-portal-alerts-changed';
const snapshot = () => { try { return localStorage.getItem(alertStorageKey); } catch { return null; } };
const subscribe = (callback) => {
  window.addEventListener('storage', callback); window.addEventListener(changeEvent, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(changeEvent, callback); };
};
const write = (state) => { localStorage.setItem(alertStorageKey, JSON.stringify(state)); window.dispatchEvent(new Event(changeEvent)); };
const JobAlertsProvider = ({ children }) => {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const state = parseAlertState(raw);
  const [error, setError] = useState('');
  const checkMatches = useCallback(() => {
    try {
      const current = parseAlertState(localStorage.getItem(alertStorageKey));
      const next = reconcileAlertMatches(current);
      if (JSON.stringify(next) !== JSON.stringify(current)) write(next);
    } catch { setError('Your browser could not update job alerts. Check local storage permissions or available space.'); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(checkMatches, 0);
    return () => window.clearTimeout(timer);
  }, [raw, checkMatches]);
  useEffect(() => {
    const interval = window.setInterval(checkMatches, 60000);
    window.addEventListener('focus', checkMatches);
    const visible = () => { if (document.visibilityState === 'visible') checkMatches(); };
    document.addEventListener('visibilitychange', visible);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', checkMatches); document.removeEventListener('visibilitychange', visible); };
  }, [checkMatches]);
  const perform = (action, payload) => {
    try {
      const current = parseAlertState(localStorage.getItem(alertStorageKey));
      write(reconcileAlertMatches(updateAlertState(current, action, payload)));
      setError('');
      if (action === 'save') notify('Alert saved. Matching sample jobs are in your notifications.');
      if (action === 'delete') notify('Alert deleted. Existing notifications are kept.');
      if (action === 'toggle') notify('Alert status updated.');
      if (action === 'check') notify('Alerts checked. New matches appear in your notification center.');
      if (action === 'read-all') notify('All notifications marked as read.');
      return true;
    } catch (failure) {
      const message = failure.name === 'QuotaExceededError' || failure.name === 'SecurityError' ? 'Your browser could not save job alerts. Check local storage permissions or available space.' : failure.message || 'Could not update this alert. Please try again.';
      setError(message); notify(message, 'error'); return false;
    }
  };
  return <JobAlertsContext.Provider value={{ ...state, unreadCount: state.notifications.filter((item) => !item.readAt).length, error, perform }}>{children}</JobAlertsContext.Provider>;
};
export default JobAlertsProvider;
