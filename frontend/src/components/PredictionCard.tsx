import BallNumber from './BallNumber'

interface PredictionCardProps {
  index: number
  red_balls: string
  blue_ball: number
  source: string
  is_hit?: boolean
  hit_level?: string
}

export default function PredictionCard({
  index,
  red_balls,
  blue_ball,
  source,
  is_hit,
  hit_level,
}: PredictionCardProps) {
  return (
    <div
      className={`bg-bg-card rounded-lg p-4 border ${
        is_hit ? 'border-green-500' : 'border-border-color'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm">预测 {index + 1}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              source === 'auto' ? 'bg-ball-blue/20 text-ball-blue' : 'bg-yellow-500/20 text-yellow-500'
            }`}
          >
            {source === 'auto' ? '自动' : '手动'}
          </span>
          {is_hit && (
            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">
              {hit_level}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex gap-1">
          {red_balls.split(',').map((ball) => (
            <BallNumber key={ball} number={parseInt(ball)} type="red" size="md" />
          ))}
        </div>
        <span className="text-text-secondary mx-1">+</span>
        <BallNumber number={blue_ball} type="blue" size="md" />
      </div>
    </div>
  )
}
