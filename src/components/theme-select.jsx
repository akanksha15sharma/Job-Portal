import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

const ThemeSelect = ({ id }) => {
  const { theme, setTheme } = useTheme();
  const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;
  return <div className="relative"><label htmlFor={id} className="sr-only">Color theme</label><Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><select id={id} value={theme} onChange={(event) => setTheme(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>;
};
export default ThemeSelect;
