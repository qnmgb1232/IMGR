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
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'algorithm'>('schedule')
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
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === 'schedule'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            定时任务
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === 'history'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            往期预测
          </button>
          <button
            onClick={() => setActiveTab('algorithm')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === 'algorithm'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            算法说明
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  定时任务说明
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      爬取开奖数据
                    </span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700">每周二、四、日 23:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      检查预测中奖
                    </span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700">每周二、四、日 23:10</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      自动生成预测
                    </span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700">每周二、四、日 23:59</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      更新统计缓存
                    </span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700">每天 21:00</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  定时任务会在后端服务运行时自动执行。双色球每周开奖3次（周二、周四、周日），开奖时间约在20:30-21:00之间。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-medium text-gray-700 mb-2">预测算法说明</h3>
                <p className="text-sm text-gray-500">
                  系统使用5种不同的预测策略，每次生成5组预测号码，涵盖热号分析、冷号回补、均衡组合等多种选号思路。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm flex items-center justify-center font-bold shadow-sm">1</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">统计主导</h4>
                      <span className="text-xs text-red-500 font-medium">频率 + 遗漏值</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    综合最近50期开奖数据，计算每个号码的出现频率和遗漏值。频率得分权重40%，遗漏值得分权重60%，综合评分后选取前6个红球和最优蓝球。
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center font-bold shadow-sm">2</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">ML主导</h4>
                      <span className="text-xs text-blue-500 font-medium">概率加权抽样</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    基于1500期历史数据计算每个号码的出现概率，使用加权随机抽样方法选号。红球和蓝球分别根据概率分布独立抽取。
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm flex items-center justify-center font-bold shadow-sm">3</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">均衡型</h4>
                      <span className="text-xs text-green-500 font-medium">热冷号均衡</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    从高频红球(前33%)中随机选3个，从低频红球(后33%)中随机选3个，组成6个红球。蓝球从近期热号中随机选择。
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm flex items-center justify-center font-bold shadow-sm">4</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">冷号回补</h4>
                      <span className="text-xs text-purple-500 font-medium">遗漏值优先</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    侧重分析长期未出现的号码，遗漏值越大评分越高。预期冷号在统计上有回补倾向，选择遗漏值最高的号码组合。
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm flex items-center justify-center font-bold shadow-sm">5</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">热号持续</h4>
                      <span className="text-xs text-orange-500 font-medium">高频号优先</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    与冷号回补相反，侧重选择近期出现频率高的号码。假设短期内趋势会延续，高频号有继续高概率出现的倾向。
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  算法选择策略
                </h4>
                <p className="text-sm text-blue-600 leading-relaxed">
                  每次预测同时使用5种策略生成5组号码，确保预测结果覆盖多种分析角度。中奖结果会在开奖后自动核对，并显示预测命中等级。
                </p>
              </div>
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
