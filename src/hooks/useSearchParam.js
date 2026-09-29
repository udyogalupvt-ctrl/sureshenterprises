import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A string state kept in the URL query, so filters survive opening a record and coming back.
 * Empty (or default) values are removed from the URL.
 */
export function useSearchParam(key, fallback = '') {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? fallback;

  const setValue = useCallback(
    (next) =>
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          if (next && next !== fallback) updated.set(key, next);
          else updated.delete(key);
          return updated;
        },
        { replace: true },
      ),
    [key, fallback, setParams],
  );

  return [value, setValue];
}
