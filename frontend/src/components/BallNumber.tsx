interface BallNumberProps {
  number: number
  type: 'red' | 'blue'
  size?: 'sm' | 'md' | 'lg'
}

export default function BallNumber({ number, type, size = 'md' }: BallNumberProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const colorClasses = {
    red: 'bg-ball-red',
    blue: 'bg-ball-blue',
  }

  return (
    <span
      className={`${sizeClasses[size]} ${colorClasses[type]} rounded-full flex items-center justify-center font-mono font-bold text-white`}
    >
      {String(number).padStart(2, '0')}
    </span>
  )
}
