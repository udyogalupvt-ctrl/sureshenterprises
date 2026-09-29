import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { CHART_MARGIN, gridProps, xAxisProps, yAxisProps } from './chartTheme';

export default function NetTrendChart({ points }) {
  return (
    // Grows to match the card beside it, but never shorter than 240px.
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <AreaChart data={points} margin={CHART_MARGIN}>
        <CartesianGrid {...gridProps} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <ReferenceLine y={0} stroke="var(--line-strong)" />
        <Tooltip cursor={{ stroke: 'var(--line-strong)' }} content={<ChartTooltip name="Net profit" />} />
        <Area
          type="linear"
          dataKey="runningNet"
          baseValue={0}
          stroke="var(--chart)"
          strokeWidth={2}
          fill="var(--chart)"
          fillOpacity={0.1}
          activeDot={{ r: 4, fill: 'var(--chart)', stroke: 'var(--surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
