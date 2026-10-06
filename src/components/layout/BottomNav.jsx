import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { NAV_ITEMS } from './navigation';

export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-canvas/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-6">
        {NAV_ITEMS.map(({ to, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 text-[10.5px] leading-none font-medium whitespace-nowrap transition-colors',
                isActive ? 'text-fg' : 'text-faint',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative grid h-7 w-12 place-items-center">
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-active"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-accent/12"
                    />
                  )}
                  <Icon className={cn('relative size-5', isActive && 'text-accent-ink')} />
                </span>
                {shortLabel}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
