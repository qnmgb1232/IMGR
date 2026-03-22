import { useEffect, useState } from 'react'
import { lotteryApi, predictionApi, statisticsApi, crawlerApi } from '../services/api'
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
  const [recentRecords, setRecentRecords] = useState<LotteryRecord[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [lastHitResult, setLastHitResult] = useState<LastHitResult | null>(null)
  const [redTrend, setRedTrend] = useState<{ ball: number; count: number }[]>([])
  const [blueTrend, setBlueTrend] = useState<{ ball: number; count: number }[]>([])
  const [redDist, setRedDist] = useState<{ ball: number; count: number }[]>([])
  const [blueDist, setBlueDist] = useState<{ ball: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState(false)

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

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await crawlerApi.fetch()
      await predictionApi.generate('manual')
      loadAllData()
    } catch (err) {
      console.error('Failed to update', err)
    } finally {
      setUpdating(false)
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
      {/* 最新开奖 + 上期预测中奖结果 - 全宽卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '0.1s'}}>
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-blue-500"></div>
        <div className="p-4">
          {/* 上期预测中奖结果 */}
          {lastHitResult && lastHitResult.predictions.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-base font-semibold text-gray-700">最新开奖结果</h2>
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {updating ? '更新中...' : '立即更新'}
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{lastHitResult.lottery.period}</span>
                  <span className="text-gray-400">{lastHitResult.lottery.draw_date}</span>
                  <span className="text-gray-400">开奖</span>
                </div>
                <div className="flex gap-1.5">
                  {lastHitResult.lottery.red_balls.split(',').map((ball) => (
                    <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                  ))}
                  <span className="text-gray-400 flex items-center mx-1">+</span>
                  <BallNumber number={lastHitResult.lottery.blue_ball} type="blue" size="sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {lastHitResult.predictions.map((pred, idx) => (
                  <div key={pred.id || idx} className={`rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all ${pred.is_hit ? 'bg-green-50 border border-green-200 shadow-sm' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <span className="text-xs text-gray-400 font-medium">{idx + 1}.</span>
                    <div className="flex gap-0.5">
                      {pred.red_balls.split(',').map((ball) => (
                        <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                      ))}
                    </div>
                    <span className="text-gray-300">+</span>
                    <BallNumber number={pred.blue_ball} type="blue" size="sm" />
                    {pred.is_hit && (
                      <span className="ml-1 text-xs text-green-600 font-semibold bg-green-100 px-1.5 py-0.5 rounded-full">{pred.hit_level}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 本期预测 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-base font-semibold text-gray-700">本期预测</h2>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {generating ? '生成中...' : '生成预测'}
            </button>
          </div>
          {predictions.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {predictions.slice(0, 5).map((pred, idx) => (
                <div key={pred.id || idx} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-gray-100 transition-colors">
                  <span className="text-xs text-gray-400 font-medium w-5">{idx + 1}.</span>
                  <div className="flex gap-0.5">
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
            <p className="text-gray-400 mt-2">暂无预测数据</p>
          )}
        </div>
      </section>

      {/* 趋势图和分布图 - 三列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 红球趋势 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              红球出现趋势
            </h2>
            <TrendChart data={redTrend} type="red" />
          </div>
        </section>

        {/* 蓝球趋势 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.25s'}}>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-blue-500 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              蓝球出现趋势
            </h2>
            <TrendChart data={blueTrend} type="blue" />
          </div>
        </section>

        {/* 红球分布饼图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              红球区间分布
            </h2>
            <PieChartSection data={redZoneData} />
          </div>
        </section>

        {/* 红球分布柱状图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.35s'}}>
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              红球号码分布
            </h2>
            <DistributionChart data={redDist} type="red" />
          </div>
        </section>

        {/* 蓝球分布 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-blue-500 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              蓝球号码分布
            </h2>
            <DistributionChart data={blueDist} type="blue" />
          </div>
        </section>

        {/* 蓝球奇偶饼图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.45s'}}>
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              蓝球奇偶分布
            </h2>
            <PieChartSection data={blueOddEvenData} />
          </div>
        </section>
      </div>

      {/* 近期开奖 - 全宽卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '0.5s'}}>
        <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
        <div className="p-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            近期开奖
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4 font-medium">期号</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell font-medium">日期</th>
                  <th className="text-left py-2 font-medium">开奖号码</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.slice(1, 8).map((record) => (
                  <tr key={record.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
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
        </div>
      </section>
    </div>
  )
}
