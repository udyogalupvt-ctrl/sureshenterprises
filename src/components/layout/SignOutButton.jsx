import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/cn';
import { signOut } from '../../services/auth';

export default function SignOutButton({ className }) {
  const handleClick = () => signOut().catch(() => toast.error('Couldn’t sign out. Please try again.'));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Sign out"
      title="Sign out"
      className={cn(
        'grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-sunken hover:text-fg',
        className,
      )}
    >
      <LogOut className="size-[18px]" />
    </button>
  );
}
