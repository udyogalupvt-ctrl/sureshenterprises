import { cn } from '../../lib/cn';

/**
 * Suresh Enterprises mark. The black swoosh switches to a white one in dark mode;
 * `onDark` always uses the white version (for surfaces that are dark in both themes).
 */
export default function Logo({ className = 'size-9', onDark = false }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 bg-contain bg-center bg-no-repeat',
        onDark ? 'bg-[url(/logo-dark.png)]' : 'bg-[url(/logo.png)] dark:bg-[url(/logo-dark.png)]',
        className,
      )}
    />
  );
}
