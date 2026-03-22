import { useEffect, useState } from 'react'
import { lotteryApi, predictionApi, statisticsApi } from '../services/api'
import BallNumber from '../components/BallNumber'
import TrendChart from '../components/TrendChart'
import DistributionChart from '../components/DistributionChart'
import PieChartSection from '../components/PieChart'

interface LotteryRecord {
  id: number
  period: string
  draw_date: string
  red_balls: string
  blue_ball: number
}

interface Prediction {
  id: number
  period: string
  red_balls: string
  blue_ball: number
  source: string
  is_hit?: boolean
  hit_level?: string
}

interface LastHitResult {
  lottery: {
    period: string
    draw_date: string
    red_balls: string
    blue_ball: number
  }
  predictions: Prediction[]
}

export default function Dashboard() {
  const [latestRecord, setLatestRecord] = useState<LotteryRecord | null>(null)
  const [recentRecords, setRecentRecords] = useState<LotteryRecord[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [lastHitResult, setLastHitResult] = useState<LastHitResult | null>(null)
  const [redTrend, setRedTrend] = useState<{ ball: number; count: number }[]>([])
  const [blueTrend, setBlueTrend] = useState<{ ball: number; count: number }[]>([])
  const [redDist, setRedDist] = useState<{ ball: number; count: number }[]>([])
  const [blueDist, setBlueDist] = useState<{ ball: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [historyRes, predRes, lastHitRes, redTrendRes, blueTrendRes, redDistRes, blueDistRes] = await Promise.all([
        lotteryApi.getHistory(10),
        predictionApi.getLatest(),
        predictionApi.getLastHitResult(),
        statisticsApi.getTrend('red', 30),
        statisticsApi.getTrend('blue', 30),
        statisticsApi.getDistribution('red'),
        statisticsApi.getDistribution('blue'),
      ])

      if (historyRes.data.code === 0) {
        const records = historyRes.data.data.records || []
        setRecentRecords(records)
        if (records.length > 0) setLatestRecord(records[0])
      }

      if (predRes.data.code === 0) {
        setPredictions(predRes.data.data.records || [])
      }

      if (lastHitRes.data.code === 0 && lastHitRes.data.data.lottery) {
        setLastHitResult(lastHitRes.data.data)
      }

      if (redTrendRes.data.code === 0) {
        const data = redTrendRes.data.data.records || []
        setRedTrend(data.map((r: { ball: number; data: number[] }) => ({
          ball: r.ball,
          count: r.data.reduce((a: number, b: number) => a + b, 0),
        })))
      }

      if (blueTrendRes.data.code === 0) {
        const data = blueTrendRes.data.data.records || []
        setBlueTrend(data.map((r: { ball: number; data: number[] }) => ({
          ball: r.ball,
          count: r.data.reduce((a: number, b: number) => a + b, 0),
        })))
      }

      if (redDistRes.data.code === 0) {
        setRedDist(redDistRes.data.data.balls || [])
      }

      if (blueDistRes.data.code === 0) {
        setBlueDist(blueDistRes.data.data.balls || [])
      }
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }

  // 计算红球区间分布
  const redZoneData = [
    { name: '小号(1-11)', value: redDist.filter(d => d.ball >= 1 && d.ball <= 11).reduce((a, b) => a + b.count, 0), color: '#ef4444' },
    { name: '中号(12-22)', value: redDist.filter(d => d.ball >= 12 && d.ball <= 22).reduce((a, b) => a + b.count, 0), color: '#f97316' },
    { name: '大号(23-33)', value: redDist.filter(d => d.ball >= 23 && d.ball <= 33).reduce((a, b) => a + b.count, 0), color: '#22c55e' },
  ]

  // 计算蓝球奇偶分布
  const blueOddEvenData = [
    { name: '奇数', value: blueDist.filter(d => d.ball % 2 === 1).reduce((a, b) => a + b.count, 0), color: '#3b82f6' },
    { name: '偶数', value: blueDist.filter(d => d.ball % 2 === 0).reduce((a, b) => a + b.count, 0), color: '#8b5cf6' },
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await predictionApi.generate('manual')
      loadAllData()
    } catch (err) {
      console.error('Failed to generate', err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 最新开奖 - 全宽卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-4">最新开奖</h2>
        {latestRecord ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <div className="flex gap-1.5 md:gap-2 flex-wrap">
              {latestRecord.red_balls.split(',').map((ball) => (
                <BallNumber key={ball} number={parseInt(ball)} type="red" size="md" />
              ))}
              <span className="text-gray-400 flex items-center mx-1">+</span>
              <BallNumber number={latestRecord.blue_ball} type="blue" size="md" />
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-mono">{latestRecord.period}</span>
              <span className="mx-2">|</span>
              <span>{latestRecord.draw_date}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">暂无数据</p>
        )}
      </section>

      {/* 预测号码 - 全宽卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700">预测号码</h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {generating ? '生成中...' : '生成预测'}
          </button>
        </div>
        {predictions.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {predictions.slice(0, 5).map((pred, idx) => (
              <div key={pred.id || idx} className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{idx + 1}.</span>
                <div className="flex gap-1">
                  {pred.red_balls.split(',').map((ball) => (
                    <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                  ))}
                </div>
                <span className="text-gray-300">+</span>
                <BallNumber number={pred.blue_ball} type="blue" size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">暂无预测数据</p>
        )}
      </section>

      {/* 上期预测中奖结果 */}
      {lastHitResult && lastHitResult.predictions.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.25s'}}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">上期预测中奖结果</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="text-sm text-gray-500">
              <span className="font-mono">{lastHitResult.lottery.period}</span>
              <span className="mx-2">|</span>
              <span>{lastHitResult.lottery.draw_date}</span>
              <span className="ml-2 text-gray-400">开奖号码</span>
            </div>
            <div className="flex gap-1.5">
              {lastHitResult.lottery.red_balls.split(',').map((ball) => (
                <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
              ))}
              <span className="text-gray-400 flex items-center mx-1">+</span>
              <BallNumber number={lastHitResult.lottery.blue_ball} type="blue" size="sm" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {lastHitResult.predictions.map((pred, idx) => (
              <div key={pred.id || idx} className={`rounded-lg px-4 py-2 flex items-center gap-2 ${pred.is_hit ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <span className="text-xs text-gray-400 w-6">{idx + 1}.</span>
                <div className="flex gap-1">
                  {pred.red_balls.split(',').map((ball) => (
                    <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                  ))}
                </div>
                <span className="text-gray-300">+</span>
                <BallNumber number={pred.blue_ball} type="blue" size="sm" />
                {pred.is_hit && (
                  <span className="ml-1 text-xs text-green-600 font-medium">{pred.hit_level}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 趋势图和分布图 - 三列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 红球趋势 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <h2 className="text-sm font-semibold text-red-500 mb-2">红球出现趋势</h2>
          <TrendChart data={redTrend} type="red" />
        </section>

        {/* 蓝球趋势 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <h2 className="text-sm font-semibold text-blue-500 mb-2">蓝球出现趋势</h2>
          <TrendChart data={blueTrend} type="blue" />
        </section>

        {/* 红球分布饼图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.5s'}}>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">红球区间分布</h2>
          <PieChartSection data={redZoneData} />
        </section>

        {/* 红球分布柱状图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
          <h2 className="text-sm font-semibold text-red-500 mb-2">红球号码分布</h2>
          <DistributionChart data={redDist} type="red" />
        </section>

        {/* 蓝球分布 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.7s'}}>
          <h2 className="text-sm font-semibold text-blue-500 mb-2">蓝球号码分布</h2>
          <DistributionChart data={blueDist} type="blue" />
        </section>

        {/* 蓝球奇偶饼图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.8s'}}>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">蓝球奇偶分布</h2>
          <PieChartSection data={blueOddEvenData} />
        </section>
      </div>

      {/* 近期开奖 - 全宽卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-slide-up" style={{animationDelay: '0.9s'}}>
        <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-4">近期开奖</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="text-left py-2 pr-4">期号</th>
                <th className="text-left py-2 pr-4 hidden sm:table-cell">日期</th>
                <th className="text-left py-2">开奖号码</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.slice(1, 8).map((record) => (
                <tr key={record.id} className="border-t border-gray-50">
                  <td className="py-2.5 pr-4 font-mono text-gray-600">{record.period}</td>
                  <td className="py-2.5 pr-4 text-gray-400 hidden sm:table-cell">{record.draw_date}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      {record.red_balls.split(',').map((ball) => (
                        <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                      ))}
                      <span className="text-gray-300 mx-1 flex items-center">+</span>
                      <BallNumber number={record.blue_ball} type="blue" size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
