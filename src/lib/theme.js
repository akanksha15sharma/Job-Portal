export const themes = ['light', 'dark', 'system'];
export const normalizeTheme = (value, fallback = 'system') => themes.includes(value) ? value : fallback;
export const resolveTheme = (value, prefersDark) => value === 'system' ? (prefersDark ? 'dark' : 'light') : value;
