import { useState } from 'react'

import { Button, Statistic } from '../../../src'

export default function StatisticDemo() {
  const [users, setUsers] = useState(12_840)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-10">
        <Statistic title="Active users" value={users} animated description="+12% vs last month" />
        <Statistic title="Revenue" value={93_210.5} precision={2} prefix="$" />
        <Statistic title="Uptime" value={99.98} precision={2} suffix="%" size="large" />
        <Statistic title="Pending" loading />
      </div>
      <div>
        <Button onClick={() => setUsers((n) => n + 1_500)}>Add 1,500 users</Button>
      </div>
    </div>
  )
}
