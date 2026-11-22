import { createContext, useContext, useEffect, useState } from 'react';
import { normalizeTheme, resolveTheme } from '@/lib/theme';
import { notify } from '@/lib/notifications';

const ThemeProviderContext = createContext(undefined);

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme' }) {
  const [theme, setThemeState] = useState(() => {
    try { return normalizeTheme(localStorage.getItem(storageKey), normalizeTheme(defaultTheme)); }
    catch { return normalizeTheme(defaultTheme); }
  });
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const root = document.documentElement;
      const resolved = resolveTheme(theme, media.matches);
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.style.colorScheme = resolved;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === storageKey || event.key === null) setThemeState(normalizeTheme(event.newValue, normalizeTheme(defaultTheme)));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey, defaultTheme]);
  const setTheme = (value) => {
    const next = normalizeTheme(value);
    setThemeState(next);
    try { localStorage.setItem(storageKey, next); }
    catch { notify('Theme changed for this visit. Your browser could not save this preference.', 'error'); }
  };
  return <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>;
}

// The public hook stays alongside the provider to preserve existing imports.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
