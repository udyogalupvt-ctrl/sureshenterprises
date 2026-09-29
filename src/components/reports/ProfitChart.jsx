import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { CHART_MARGIN, gridProps, xAxisProps, yAxisProps } from './chartTheme';

export default function ProfitChart({ points }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={points} margin={CHART_MARGIN}>
        <CartesianGrid {...gridProps} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip cursor={{ fill: 'var(--sunken)' }} content={<ChartTooltip name="Profit" />} />
        <Bar dataKey="profit" fill="var(--chart)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
