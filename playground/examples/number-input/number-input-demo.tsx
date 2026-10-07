import { useId, useState } from 'react'

import { Label, NumberInput } from '../../../src'

export default function NumberInputDemo() {
  const [quantity, setQuantity] = useState<number | null>(1)
  const id = useId()

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Quantity</Label>
      <NumberInput id={id} value={quantity} onValueChange={setQuantity} min={0} max={99} />
      <p className="text-xs text-foreground-lighter">
        Use ↑/↓ (Shift for ×10), Home/End, or the buttons. Value: {quantity ?? 'empty'}
      </p>
    </div>
  )
}
