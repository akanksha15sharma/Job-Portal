import { useState, useSyncExternalStore } from 'react';
import { getActionMessage, notify } from '../lib/notifications';
import { jobStorageKey, parseJobActions, updateJobActions } from '../lib/job-storage';

const changeEvent = 'job-portal-actions-changed';
const subscribe = (callback) => {
  window.addEventListener('storage', callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(changeEvent, callback);
  };
};
const getSnapshot = () => {
  try { return window.localStorage.getItem(jobStorageKey); }
  catch { return null; }
};

export function useJobActions() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [error, setError] = useState('');
  const actions = parseJobActions(raw);
  const perform = (action, id, details) => {
    try {
      const current = parseJobActions(window.localStorage.getItem(jobStorageKey));
      window.localStorage.setItem(jobStorageKey, JSON.stringify(updateJobActions(current, action, id, details)));
      window.dispatchEvent(new Event(changeEvent));
      setError('');
      notify(getActionMessage(action, current, id, details));
      return true;
    } catch {
      const message = 'Your browser could not save this action. Enable local storage and try again.';
      setError(message);
      notify(message, 'error');
      return false;
    }
  };
  return { ...actions, perform, error };
}
