import { Textarea } from '../../../src'

export default function TextareaStates() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Textarea placeholder="Tell us what happened" aria-label="What happened" />
      <Textarea aria-invalid defaultValue="Too short" aria-label="Description (invalid)" />
      <Textarea disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  )
}
