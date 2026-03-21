import { useEffect, useState } from 'react'
import { predictionApi } from '../services/api'
import PredictionCard from '../components/PredictionCard'

interface Prediction {
  id: number
  period: string
  red_balls: string
  blue_ball: number
  source: string
  is_hit?: boolean
  hit_level?: string
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const res = await predictionApi.getLatest()
      if (res.data.code === 0) {
        setPredictions(res.data.data.records || [])
      }
    } catch (err) {
      console.error('Failed to load predictions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await predictionApi.generate('manual')
      if (res.data.code === 0) {
        loadPredictions()
      }
    } catch (err) {
      console.error('Failed to generate', err)
    } finally {
      setGenerating(false)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">预测号码</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-ball-blue text-white rounded-lg hover:bg-ball-blue/80 disabled:opacity-50 transition-colors"
        >
          {generating ? '生成中...' : '手动生成预测'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((pred, idx) => (
          <PredictionCard
            key={pred.id || idx}
            index={idx}
            red_balls={pred.red_balls}
            blue_ball={pred.blue_ball}
            source={pred.source}
            is_hit={pred.is_hit}
            hit_level={pred.hit_level}
          />
        ))}
      </div>

      {predictions.length === 0 && (
        <p className="text-text-secondary text-center py-8">暂无预测数据</p>
      )}
    </div>
  )
}
