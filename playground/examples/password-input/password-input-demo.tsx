import { useId } from 'react'

import { Label, PasswordInput } from '../../../src'

export default function PasswordInputDemo() {
  const current = useId()
  const next = useId()

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={current}>Current password</Label>
        <PasswordInput id={current} defaultValue="hunter2" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={next}>New password</Label>
        <PasswordInput id={next} autoComplete="new-password" showStrength placeholder="At least 12 characters" />
      </div>
    </div>
  )
}
