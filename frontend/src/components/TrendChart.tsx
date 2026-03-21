import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: { ball: number; count: number }[]
  type: 'red' | 'blue'
}

export default function TrendChart({ data, type }: TrendChartProps) {
  const color = type === 'red' ? '#e94560' : '#0ea5e9'

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="ball"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
          label={{ value: '球号', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
          label={{ value: '出现次数', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#16213e', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
          name="出现次数"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
