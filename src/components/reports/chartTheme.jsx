import { formatINRCompact } from '../../lib/format';

// Colours come from CSS variables so charts follow light/dark mode automatically.
// The right margin leaves room for the last x-axis label, which sits on the plot's edge in line charts.
export const CHART_MARGIN = { top: 8, right: 24, bottom: 0, left: 0 };

export const gridProps = { vertical: false, stroke: 'var(--line)' };

export const xAxisProps = {
  dataKey: 'label',
  tickLine: false,
  axisLine: { stroke: 'var(--line-strong)' },
  tick: { fill: 'var(--faint)', fontSize: 12 },
  tickMargin: 8,
  minTickGap: 12,
};

export const yAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--faint)', fontSize: 12 },
  tickFormatter: formatINRCompact,
  width: 60,
};
