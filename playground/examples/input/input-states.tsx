import { Input } from '../../../src'

export default function InputStates() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Input placeholder="Default" aria-label="Default" />
      <Input aria-invalid defaultValue="not-an-email" aria-label="Email (invalid)" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
      <Input readOnly value="Read only" aria-label="Read only" />
    </div>
  )
}
