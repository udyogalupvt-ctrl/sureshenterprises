import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary: 'bg-accent text-accent-fg shadow-sm hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-fg shadow-soft hover:border-line-strong hover:bg-sunken',
  ghost: 'text-muted hover:bg-sunken hover:text-fg',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  'danger-ghost': 'text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
};

const SIZES = {
  md: 'h-11 gap-2 px-4 text-sm [&_svg]:size-4',
  sm: 'h-9 gap-1.5 px-3 text-sm [&_svg]:size-4',
  icon: 'size-10 [&_svg]:size-[18px]',
};

/** Renders a router link when `to` is set, otherwise a button. `loading` swaps the icon for a spinner. */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  to,
  className,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-xl font-medium',
    'transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25',
    'disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {loading ? <LoaderCircle className="animate-spin" /> : Icon && <Icon />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
