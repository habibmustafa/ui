import { useState } from 'react'

import { TimePicker } from '../../../src'

export default function TimePickerDemo() {
  const [time, setTime] = useState<string | null>('09:30')

  return (
    <div className="flex flex-col items-center gap-3">
      <TimePicker aria-label="Backup time" value={time} onValueChange={setTime} />
      <p className="text-xs text-foreground-lighter">
        Value: <code className="font-mono">{time ?? 'null'}</code> — ↑/↓, type digits, ←/→
      </p>
    </div>
  )
}
