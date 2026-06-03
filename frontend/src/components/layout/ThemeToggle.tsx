import { MoonStar, SunMedium } from 'lucide-react';
import { Button } from '../ui/button';
import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="rounded-xl"
    >
      {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
    </Button>
  );
}
