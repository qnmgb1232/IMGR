import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'

interface DistributionChartProps {
  data: { ball: number; count: number }[]
  type: 'red' | 'blue'
}

export default function DistributionChart({ data, type }: DistributionChartProps) {
  const color = type === 'red' ? '#e94560' : '#0ea5e9'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="ball"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={color} />
          ))}
          <LabelList dataKey="count" position="top" fill="#e2e8f0" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
