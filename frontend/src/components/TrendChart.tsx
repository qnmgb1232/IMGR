import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: { ball: number; count: number }[]
  type: 'red' | 'blue'
}

export default function TrendChart({ data, type }: TrendChartProps) {
  const color = type === 'red' ? '#e94560' : '#0ea5e9'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="ball"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={{ stroke: '#e2e8f0' }}
          width={35}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          labelStyle={{ color: '#64748b' }}
          itemStyle={{ color: '#64748b' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
