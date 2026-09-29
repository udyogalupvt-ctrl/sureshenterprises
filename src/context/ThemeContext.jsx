import { createContext, use, useEffect, useState, useSyncExternalStore } from 'react';

// Must match the inline script in index.html.
const STORAGE_KEY = 'se-theme';
const PREFERENCES = ['light', 'dark', 'system'];
const DEFAULT_PREFERENCE = 'light';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLORS = { light: '#f5f6f4', dark: '#0a0c0b' };

const ThemeContext = createContext(null);

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(saved) ? saved : DEFAULT_PREFERENCE;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

function subscribeToSystemTheme(onChange) {
  const media = matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const systemPrefersDark = () => matchMedia(DARK_QUERY).matches;

/** `preference` is what the user picked (light / dark / system); `theme` is what's actually shown. */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference);
  const prefersDark = useSyncExternalStore(subscribeToSystemTheme, systemPrefersDark);
  const theme = preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  const setPreference = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this visit.
    }
    setPreferenceState(next);
  };

  return <ThemeContext value={{ preference, theme, setPreference }}>{children}</ThemeContext>;
}

export const useTheme = () => use(ThemeContext);
