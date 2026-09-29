import { motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../../context/AuthContext';
import { cn } from '../../lib/cn';
import Logo from '../ui/Logo';
import { NAV_ITEMS } from './navigation';
import SignOutButton from './SignOutButton';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const user = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-canvas px-4 py-6 lg:flex">
      <Link to="/" className="flex items-center gap-3 px-2">
        <Logo className="size-9" />
        <div className="leading-tight">
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
            className={({ isActive }) =>
              cn(
                'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
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
                <Icon className={cn('relative size-[18px]', isActive && 'text-accent-ink')} />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <ThemeToggle showLabel />
        <div className="mt-3 flex items-center gap-3 border-t border-line pt-4 pl-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent-ink uppercase">
            {user.email?.[0] ?? 'S'}
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] text-muted">{user.email}</p>
          <SignOutButton className="size-8 rounded-lg" />
        </div>
      </div>
    </aside>
  );
}
