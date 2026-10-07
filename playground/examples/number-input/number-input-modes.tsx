import { useId, useState } from 'react'

import { Label, NumberInput } from '../../../src'

export default function NumberInputModes() {
  const [count, setCount] = useState<number | null>(3)
  const [weight, setWeight] = useState<number | null>(72.5)
  const countId = useId()
  const weightId = useId()

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={countId}>Guests (numeric)</Label>
        <NumberInput id={countId} mode="numeric" min={0} value={count} onValueChange={setCount} />
        <p className="text-xs text-foreground-lighter">Whole numbers only. Value: {count ?? 'empty'}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={weightId}>Weight in kg (decimal)</Label>
        <NumberInput
          id={weightId}
          mode="decimal"
          decimalPlaces={1}
          step={0.5}
          min={0}
          value={weight}
          onValueChange={setWeight}
        />
        <p className="text-xs text-foreground-lighter">
          One "." or "," and up to 1 decimal place. Value: {weight ?? 'empty'}
        </p>
      </div>
    </div>
  )
}
