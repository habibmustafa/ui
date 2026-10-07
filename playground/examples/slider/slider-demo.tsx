import { useId, useState } from 'react'

import { Slider } from '../../../src'

export default function SliderDemo() {
  const [value, setValue] = useState([40])
  const labelId = useId()

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span id={labelId} className="text-foreground-light">
          Volume
        </span>
        <span className="tabular-nums text-foreground">{value[0]}%</span>
      </div>
      <Slider value={value} onValueChange={setValue} max={100} step={1} aria-labelledby={labelId} />
    </div>
  )
}
