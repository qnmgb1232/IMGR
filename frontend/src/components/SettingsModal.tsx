import { useState, useEffect } from 'react'
import { settingsApi } from '../services/api'
import BallNumber from './BallNumber'

interface PredictionRecord {
  id: number
  period: string
  predict_date: string
  red_balls: string
  blue_ball: number
  source: string
  is_hit: boolean
  hit_level: string
  lottery_red: string
  lottery_blue: number
  lottery_date: string
}

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule')
  const [history, setHistory] = useState<PredictionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadHistory()
    }
  }, [isOpen, activeTab])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await settingsApi.getPredictionHistory(100)
      if (res.data.code === 0) {
        setHistory(res.data.data.records || [])
        // 默认选中最近一期
        if (!selectedPeriod && res.data.data.records.length > 0) {
          setSelectedPeriod(res.data.data.records[0].period)
        }
      }
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }

  // 按期号分组
  const groupedByPeriod = history.reduce((acc, pred) => {
    if (!acc[pred.period]) {
      acc[pred.period] = {
        lottery_red: pred.lottery_red,
        lottery_blue: pred.lottery_blue,
        lottery_date: pred.lottery_date,
        predictions: []
      }
    }
    acc[pred.period].predictions.push(pred)
    return acc
  }, {} as Record<string, { lottery_red: string; lottery_blue: number; lottery_date: string; predictions: PredictionRecord[] }>)

  const periods = Object.keys(groupedByPeriod).sort((a, b) => b.localeCompare(a))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">设置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            定时任务
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            往期预测
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-700 mb-3">定时任务说明</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-gray-500">爬取开奖数据</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">每周二、四、日 23:00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-gray-500">检查预测中奖</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">每周二、四、日 23:10</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-gray-500">自动生成预测</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">每周二、四、日 23:59</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-gray-500">更新统计缓存</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">每天 21:00</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                定时任务会在后端服务运行时自动执行。双色球每周开奖3次（周二、周四、周日），开奖时间约在20:30-21:00之间。
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : periods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无预测记录</div>
              ) : (
                <div className="space-y-4">
                  {/* 期号选择器 */}
                  <div className="flex flex-wrap gap-2">
                    {periods.slice(0, 10).map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedPeriod === period
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* 选中期号的详情 */}
                  {selectedPeriod && groupedByPeriod[selectedPeriod] && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="font-mono font-medium">{selectedPeriod}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-sm text-gray-500">{groupedByPeriod[selectedPeriod].lottery_date}</span>
                        </div>
                        <div className="text-sm text-gray-500">开奖号码</div>
                      </div>
                      <div className="flex gap-1.5 mb-4 pb-4 border-b border-gray-200">
                        {groupedByPeriod[selectedPeriod].lottery_red?.split(',').map((ball) => (
                          <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                        ))}
                        <span className="text-gray-400 flex items-center mx-1">+</span>
                        <BallNumber number={groupedByPeriod[selectedPeriod].lottery_blue} type="blue" size="sm" />
                      </div>

                      <h4 className="text-sm font-medium text-gray-600 mb-3">预测结果</h4>
                      <div className="space-y-2">
                        {groupedByPeriod[selectedPeriod].predictions.map((pred, idx) => (
                          <div
                            key={pred.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              pred.is_hit ? 'bg-green-50 border border-green-200' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-6">{idx + 1}.</span>
                              <div className="flex gap-1">
                                {pred.red_balls.split(',').map((ball) => (
                                  <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                                ))}
                              </div>
                              <span className="text-gray-300">+</span>
                              <BallNumber number={pred.blue_ball} type="blue" size="sm" />
                            </div>
                            {pred.is_hit && (
                              <span className="text-sm text-green-600 font-medium">{pred.hit_level}</span>
                            )}
                            {!pred.is_hit && (
                              <span className="text-xs text-gray-400">未中奖</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
