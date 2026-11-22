import { useState, useSyncExternalStore } from 'react';
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
  const perform = (action, id) => {
    try {
      const current = parseJobActions(window.localStorage.getItem(jobStorageKey));
      window.localStorage.setItem(jobStorageKey, JSON.stringify(updateJobActions(current, action, id)));
      window.dispatchEvent(new Event(changeEvent));
      setError('');
    } catch {
      setError('Your browser could not save this action. Enable local storage and try again.');
    }
  };
  return { ...actions, perform, error };
}
