import { formatINR } from '../../lib/format';

export default function ChartTooltip({ active, payload, name }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-float">
      <p className="text-muted">{payload[0].payload.fullLabel}</p>
      <p className="mt-1 flex items-center gap-2 text-fg">
        <span className="size-2 rounded-full bg-chart" />
        {name}
        <span className="ml-auto pl-4 font-semibold tabular-nums">{formatINR(payload[0].value)}</span>
      </p>
    </div>
  );
}
