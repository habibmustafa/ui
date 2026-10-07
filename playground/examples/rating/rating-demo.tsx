import { useState } from 'react'

import { Rating } from '../../../src'

export default function RatingDemo() {
  const [value, setValue] = useState(3)
  return (
    <div className="flex flex-col items-start gap-2">
      <Rating aria-label="Rate this product" value={value} onValueChange={setValue} allowClear />
      <p className="text-sm text-foreground-light">{value === 0 ? 'Not rated' : `${value} / 5`}</p>
    </div>
  )
}
