import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface TrendChartProps {
  data: { ball: number; count: number }[]
  type: 'red' | 'blue'
}

export default function TrendChart({ data, type }: TrendChartProps) {
  const color = type === 'red' ? '#e94560' : '#0ea5e9'

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis
          dataKey="ball"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis hide />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_entry, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
