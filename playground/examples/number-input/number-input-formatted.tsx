import { NumberInput } from '../../../src'

export default function NumberInputFormatted() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <NumberInput
        aria-label="Price"
        prefix="$"
        defaultValue={19.99}
        step={0.01}
        min={0}
        format={(value) => value.toFixed(2)}
      />
      <NumberInput aria-label="Percentage" defaultValue={50} step={5} min={0} max={100} size="tiny" />
      <NumberInput aria-label="Read-only count" defaultValue={12} readOnly hideControls />
      <NumberInput aria-label="Disabled count" defaultValue={3} disabled />
    </div>
  )
}
