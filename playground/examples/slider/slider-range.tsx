import { useState } from 'react'

import { Slider } from '../../../src'

export default function SliderRange() {
  const [range, setRange] = useState([20, 80])

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span className="text-foreground-light">Price</span>
        <span className="tabular-nums text-foreground">
          ${range[0]} – ${range[1]}
        </span>
      </div>
      <Slider
        value={range}
        onValueChange={setRange}
        max={100}
        step={5}
        minStepsBetweenThumbs={1}
        thumbLabels={['Minimum price', 'Maximum price']}
      />
    </div>
  )
}
