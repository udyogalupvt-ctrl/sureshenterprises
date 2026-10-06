import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';
import Logo from '../ui/Logo';
import SegmentedControl from '../ui/SegmentedControl';
import { NAV_ITEMS } from './navigation';
import SignOutButton from './SignOutButton';
import { THEME_OPTIONS } from './themeOptions';

export default function Sidebar({ collapsed, onToggle }) {
  const user = useUser();
  const { preference, setPreference } = useTheme();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-canvas py-6 transition-[width] duration-200 lg:flex',
        collapsed ? 'w-20 px-3' : 'w-64 px-4',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
        title={collapsed ? 'Open sidebar' : 'Close sidebar'}
        className="absolute top-9 -right-3 z-10 grid size-6 place-items-center rounded-full border border-line bg-surface text-muted shadow-soft transition-colors hover:text-fg focus-visible:ring-4 focus-visible:ring-accent/25 focus-visible:outline-none"
      >
        {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      <Link to="/" className={cn('flex items-center gap-3 px-2', collapsed && 'justify-center px-0')} title="Dashboard">
        <Logo className="size-9 shrink-0" />
        <div className={cn('leading-tight', collapsed && 'sr-only')}>
          <p className="text-[15px] font-semibold text-fg">Suresh Enterprises</p>
          <p className="text-xs text-faint">Profit tracker</p>
        </div>
      </Link>

      <nav aria-label="Main" className="mt-10 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'text-fg' : 'text-muted hover:bg-sunken hover:text-fg',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    className="absolute inset-0 rounded-xl border border-line bg-raised shadow-soft"
                  />
                )}
                <Icon className={cn('relative size-[18px] shrink-0', isActive && 'text-accent-ink')} />
                <span className={cn('relative', collapsed && 'sr-only')}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        {!collapsed && (
          <div className="flex items-center justify-between gap-3 pl-3">
            <span className="text-sm font-medium text-muted">Theme</span>
            <SegmentedControl
              label="Theme"
              iconOnly
              options={THEME_OPTIONS}
              value={preference}
              onChange={setPreference}
            />
          </div>
        )}
        <div
          className={cn(
            'mt-4 flex items-center gap-3 border-t border-line pt-4',
            collapsed ? 'flex-col' : 'pl-2',
          )}
        >
          <span
            title={user.email ?? undefined}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent-ink uppercase"
          >
            {user.email?.[0] ?? 'S'}
          </span>
          {!collapsed && <p className="min-w-0 flex-1 truncate text-[13px] text-muted">{user.email}</p>}
          <SignOutButton className="size-8 rounded-lg" />
        </div>
      </div>
    </aside>
  );
}
