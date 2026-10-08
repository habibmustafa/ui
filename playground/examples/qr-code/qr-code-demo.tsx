import { useState } from 'react'

import { Input, QRCode, ToggleGroup, type QRLevel } from '../../../src'

export default function QRCodeDemo() {
  const [value, setValue] = useState('https://ui.habibmustafa.me')
  const [level, setLevel] = useState<QRLevel>('M')

  return (
    <div className="flex flex-wrap items-start gap-8">
      <QRCode value={value || ' '} level={level} size={176} label={`QR code for ${value}`} />
      <div className="flex w-72 flex-col gap-3">
        <Input aria-label="Text to encode" value={value} onChange={(e) => setValue(e.target.value)} />
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Error correction"
          value={level}
          onValueChange={(next: string) => next && setLevel(next as QRLevel)}
          items={(['L', 'M', 'Q', 'H'] as const).map((l) => ({ value: l, label: l }))}
        />
      </div>
    </div>
  )
}
