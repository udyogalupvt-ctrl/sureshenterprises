import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export default function ThemeToggle({ showLabel = false, className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center gap-3 rounded-xl text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-fg',
        showLabel ? 'h-10 w-full px-3' : 'size-10 justify-center',
        className,
      )}
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      {showLabel && label}
    </button>
  );
}
