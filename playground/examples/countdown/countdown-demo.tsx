import { useState } from 'react'

import { Countdown } from '../../../src'

const HOUR = 60 * 60 * 1000

export default function CountdownDemo() {
  // Fixed once per mount so the deadline doesn't move on re-render.
  const [sale] = useState(() => Date.now() + 26 * HOUR + 15 * 60 * 1000 + 30 * 1000)
  const [offer] = useState(() => Date.now() + 5 * 60 * 1000)
  const [done, setDone] = useState(false)

  return (
    <div className="flex flex-wrap gap-10">
      <Countdown title="Sale ends in" value={sale} format="D [days] HH:mm:ss" />
      <Countdown
        title={done ? 'Offer expired' : 'Offer ends in'}
        value={offer}
        format="mm:ss"
        size="large"
        onFinish={() => setDone(true)}
      />
    </div>
  )
}
