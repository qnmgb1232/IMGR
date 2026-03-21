import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  nextDrawDate: Date
}

export default function CountdownTimer({ nextDrawDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const diff = nextDrawDate.getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [nextDrawDate])

  return (
    <div className="flex gap-4 text-center">
      <div className="bg-bg-card rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold font-mono">{timeLeft.days}</div>
        <div className="text-xs text-text-secondary">天</div>
      </div>
      <div className="bg-bg-card rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold font-mono">{timeLeft.hours}</div>
        <div className="text-xs text-text-secondary">时</div>
      </div>
      <div className="bg-bg-card rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold font-mono">{timeLeft.minutes}</div>
        <div className="text-xs text-text-secondary">分</div>
      </div>
      <div className="bg-bg-card rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold font-mono text-ball-red">{timeLeft.seconds}</div>
        <div className="text-xs text-text-secondary">秒</div>
      </div>
    </div>
  )
}
