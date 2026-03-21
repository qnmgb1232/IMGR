import { useEffect, useState } from 'react'
import { lotteryApi } from '../services/api'
import LotteryTable from '../components/LotteryTable'

interface LotteryRecord {
  id: number
  period: string
  draw_date: string
  red_balls: string
  blue_ball: number
}

export default function Home() {
  const [records, setRecords] = useState<LotteryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await lotteryApi.getHistory(20)
      if (res.data.code === 0) {
        setRecords(res.data.data.records || [])
      }
    } catch (err) {
      console.error('Failed to load data', err)
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
      <h1 className="text-2xl font-bold mb-6">历史开奖数据</h1>

      <div className="bg-bg-card rounded-lg p-6">
        {records.length > 0 ? (
          <LotteryTable records={records} />
        ) : (
          <p className="text-text-secondary text-center py-8">暂无数据</p>
        )}
      </div>
    </div>
  )
}
