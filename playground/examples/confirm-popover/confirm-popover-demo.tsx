import { useState } from 'react'

import { Button, ConfirmPopover } from '../../../src'

export default function ConfirmPopoverDemo() {
  const [keys, setKeys] = useState(['anon', 'service_role', 'ci-deploy'])

  return (
    <ul className="flex w-full max-w-sm flex-col gap-2">
      {keys.map((key) => (
        <li key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="font-mono text-sm text-foreground">{key}</span>
          <ConfirmPopover
            title={`Revoke "${key}"?`}
            description="Requests using this key will start failing immediately."
            confirmText="Revoke"
            destructive
            onConfirm={() =>
              // Simulated request
              new Promise<void>((resolve) =>
                setTimeout(() => {
                  setKeys((current) => current.filter((k) => k !== key))
                  resolve()
                }, 600)
              )
            }
            trigger={
              <Button variant="default" size="tiny">
                Revoke
              </Button>
            }
          />
        </li>
      ))}
    </ul>
  )
}
