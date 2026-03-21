import { useEffect, useState } from 'react'
import { statisticsApi } from '../services/api'
import TrendChart from '../components/TrendChart'

interface TrendData {
  records: { ball: number; data: number[] }[]
}

export default function Trends() {
  const [redTrend, setRedTrend] = useState<{ ball: number; count: number }[]>([])
  const [blueTrend, setBlueTrend] = useState<{ ball: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [periods, setPeriods] = useState(50)

  useEffect(() => {
    loadData()
  }, [periods])

  const loadData = async () => {
    setLoading(true)
    try {
      const [redRes, blueRes] = await Promise.all([
        statisticsApi.getTrend('red', periods),
        statisticsApi.getTrend('blue', periods),
      ])

      if (redRes.data.code === 0) {
        const trendData: TrendData = redRes.data.data
        const redCounts = trendData.records.map((r: { ball: number; data: number[] }) => ({
          ball: r.ball,
          count: r.data.reduce((a: number, b: number) => a + b, 0),
        }))
        setRedTrend(redCounts)
      }

      if (blueRes.data.code === 0) {
        const trendData: TrendData = blueRes.data.data
        const blueCounts = trendData.records.map((r: { ball: number; data: number[] }) => ({
          ball: r.ball,
          count: r.data.reduce((a: number, b: number) => a + b, 0),
        }))
        setBlueTrend(blueCounts)
      }
    } catch (err) {
      console.error('Failed to load trend data', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">走势图</h1>
        <select
          value={periods}
          onChange={(e) => setPeriods(Number(e.target.value))}
          className="bg-bg-card border border-border-color rounded px-3 py-2 text-text-primary"
        >
          <option value={20}>近20期</option>
          <option value={50}>近50期</option>
          <option value={100}>近100期</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">加载中...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-bg-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-ball-red">红球出现次数</h2>
            <TrendChart data={redTrend} type="red" />
          </div>

          <div className="bg-bg-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-ball-blue">蓝球出现次数</h2>
            <TrendChart data={blueTrend} type="blue" />
          </div>
        </div>
      )}
    </div>
  )
}
