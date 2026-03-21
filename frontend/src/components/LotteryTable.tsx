import BallNumber from './BallNumber'

interface LotteryRecord {
  id: number
  period: string
  draw_date: string
  red_balls: string
  blue_ball: number
}

interface LotteryTableProps {
  records: LotteryRecord[]
}

export default function LotteryTable({ records }: LotteryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-color text-text-secondary">
            <th className="py-3 px-4 text-left">期号</th>
            <th className="py-3 px-4 text-left">开奖日期</th>
            <th className="py-3 px-4 text-left">红球</th>
            <th className="py-3 px-4 text-left">蓝球</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={record.id}
              className={`border-b border-border-color ${
                idx % 2 === 0 ? 'bg-bg-card/30' : ''
              } hover:bg-bg-card/50`}
            >
              <td className="py-3 px-4 font-mono">{record.period}</td>
              <td className="py-3 px-4">{record.draw_date}</td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  {record.red_balls.split(',').map((ball) => (
                    <BallNumber key={ball} number={parseInt(ball)} type="red" size="sm" />
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <BallNumber number={record.blue_ball} type="blue" size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
