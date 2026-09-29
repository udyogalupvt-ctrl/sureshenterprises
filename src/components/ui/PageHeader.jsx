import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({ eyebrow, title, actions, backTo, backLabel }) {
  return (
    <header className="mb-6 lg:mb-8">
      {backTo && (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-[13px] font-medium text-faint">{eyebrow}</p>}
          <h1 className="font-display text-[34px] leading-[1.05] text-fg lg:text-[42px]">{title}</h1>
        </div>
        {actions}
      </div>
    </header>
  );
}
