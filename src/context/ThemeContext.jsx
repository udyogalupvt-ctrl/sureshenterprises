import { createContext, use, useEffect, useState } from 'react';

// Must match the key read by the inline script in index.html.
const STORAGE_KEY = 'se-theme';
const THEME_COLORS = { light: '#f5f6f4', dark: '#0a0c0b' };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // index.html applies the saved theme before first paint; start from what it chose.
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
    setTheme(next);
  };

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => use(ThemeContext);
