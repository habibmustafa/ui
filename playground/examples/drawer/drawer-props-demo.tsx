'use client'

import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { Button, Drawer } from '../../../src'

const data = [
  { goal: 400 },
  { goal: 300 },
  { goal: 200 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 239 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 349 },
]

export default function DrawerPropsDemo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer
      trigger={
        <Button size="small">Open Drawer</Button>
      }
      title="Move Goal"
      description="Set your daily activity goal."
      classNames={{ body: 'mx-auto w-full max-w-sm p-4 pb-0' }}
      footer={({ close }) => (
        <>
          <Button variant="primary">Submit</Button>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        </>
      )}
    >
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="small"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => onClick(-10)}
          disabled={goal <= 200}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease</span>
        </Button>
        <div className="flex-1 text-center">
          <div className="text-7xl font-bold tracking-tighter">{goal}</div>
          <div className="text-[0.70rem] uppercase text-muted-foreground">Calories/day</div>
        </div>
        <Button
          variant="outline"
          size="small"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => onClick(10)}
          disabled={goal >= 400}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
      <div className="mt-3 h-30">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar
              dataKey="goal"
              style={
                {
                  fill: 'var(--foreground-default)',
                  opacity: 0.9,
                } as React.CSSProperties
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Drawer>
  )
}
