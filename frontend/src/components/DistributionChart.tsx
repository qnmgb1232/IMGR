import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface DistributionChartProps {
  data: { ball: number; count: number }[]
  type: 'red' | 'blue'
}

export default function DistributionChart({ data, type }: DistributionChartProps) {
  const color = type === 'red' ? '#e94560' : '#0ea5e9'

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="ball"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} width={30} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
