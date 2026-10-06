import { useCallback, useState } from 'react';

const STORAGE_KEY = 'sidebar-collapsed';

/** Desktop sidebar open/closed state, remembered per device. Storage can be blocked, so every access is guarded. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignored: the sidebar still toggles for this visit.
      }
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
