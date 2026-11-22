import { useState, useSyncExternalStore } from 'react';
import { notify } from '@/lib/notifications';
import { parseProfile, profileStorageKey } from '@/lib/profile';
const eventName = 'job-portal-profile-changed';
const getSnapshot = () => { try { return localStorage.getItem(profileStorageKey); } catch { return null; } };
const subscribe = (callback) => {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(eventName, callback); };
};
export function useProfile() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [error, setError] = useState('');
  const saveProfile = (profile) => {
    try {
      const saved = parseProfile(JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
      localStorage.setItem(profileStorageKey, JSON.stringify(saved));
      window.dispatchEvent(new Event(eventName));
      setError('');
      notify('Profile saved. Your dashboard and navigation are up to date.');
      return true;
    } catch {
      const message = 'Your browser could not save this profile. Try removing the PDF to free space, or check local storage permissions.';
      setError(message); notify(message, 'error'); return false;
    }
  };
  return { profile: parseProfile(raw), saveProfile, error, raw };
}
