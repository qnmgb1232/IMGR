import { useEffect, useState } from 'react'
import { statisticsApi } from '../services/api'
import DistributionChart from '../components/DistributionChart'

export default function Distribution() {
  const [redDist, setRedDist] = useState<{ ball: number; count: number }[]>([])
  const [blueDist, setBlueDist] = useState<{ ball: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [redRes, blueRes] = await Promise.all([
        statisticsApi.getDistribution('red'),
        statisticsApi.getDistribution('blue'),
      ])

      if (redRes.data.code === 0) {
        setRedDist(redRes.data.data.balls || [])
      }
      if (blueRes.data.code === 0) {
        setBlueDist(blueRes.data.data.balls || [])
      }
    } catch (err) {
      console.error('Failed to load distribution data', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">加载中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">号码分布</h1>

      <div className="space-y-8">
        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-ball-red">红球分布 (近100期)</h2>
          <DistributionChart data={redDist} type="red" />
        </div>

        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-ball-blue">蓝球分布 (近100期)</h2>
          <DistributionChart data={blueDist} type="blue" />
        </div>
      </div>
    </div>
  )
}
