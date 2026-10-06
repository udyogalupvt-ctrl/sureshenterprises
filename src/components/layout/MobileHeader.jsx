import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { DueBell } from './DueReminder';
import SignOutButton from './SignOutButton';
import ThemeToggle from './ThemeToggle';

export default function MobileHeader({ reminderCount, onOpenReminders }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between pr-2 pl-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="size-8" />
          <span className="text-[15px] font-semibold text-fg">Suresh Enterprises</span>
        </Link>
        <div className="flex items-center">
          <DueBell count={reminderCount} onClick={onOpenReminders} className="size-10 justify-center" />
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
