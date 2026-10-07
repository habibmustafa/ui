import { useEffect, useState } from 'react'

import { CircularProgress } from '../../../src'

export default function CircularProgressDemo() {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-6">
      <CircularProgress value={value} showValue aria-label="Upload" />
      <CircularProgress value={72} tone="success" showValue size={48} thickness={4} aria-label="Storage" />
      <CircularProgress value={90} tone="destructive" size={96} thickness={8} aria-label="Quota">
        <span className="text-lg">9/10</span>
      </CircularProgress>
      <CircularProgress aria-label="Loading" size={32} thickness={3} />
    </div>
  )
}
