import { cn } from '../../lib/cn';
import { Card } from '../ui/Card';

export default function ChartCard({ title, description, className, children }) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className="min-h-0 flex-1 p-5 pt-4">{children}</div>
    </Card>
  );
}
