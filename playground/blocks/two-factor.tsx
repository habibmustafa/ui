import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Button, Countdown, InputOTP, Result } from '../../src'

/** There is no server here: this is the code that counts as correct. */
const VALID_CODE = '123456'
const WAIT = 30 * 1000

export default function TwoFactor() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [deadline, setDeadline] = useState(() => Date.now() + WAIT)
  const [canResend, setCanResend] = useState(false)

  const check = (value: string) => {
    if (value === VALID_CODE) return setVerified(true)
    setError('That code is not right. Check the app and try again.')
    setCode('')
  }

  if (verified) {
    return (
      <div className="w-full max-w-sm rounded-xl border bg-surface-100 p-6 shadow-lg sm:p-8">
        <Result
          status="success"
          size="small"
          level={3}
          title="You are verified"
          description="This device will not ask for a code for 30 days."
          extra={<Button variant="primary">Continue to the dashboard</Button>}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-xl border bg-surface-100 p-6 shadow-lg sm:p-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-surface-75 text-foreground-light">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Enter your code</h3>
      <p className="mt-1 text-sm text-foreground-light">Open your authenticator app and type the 6-digit code it shows.</p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <InputOTP
          aria-label="One-time code"
          slots={6}
          groupSize={3}
          value={code}
          onChange={(value) => {
            setCode(value)
            setError(null)
          }}
          onComplete={check}
          autoFocus
        />
        {error ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-center text-xs text-foreground-lighter">For this demo, the code is {VALID_CODE}.</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 text-sm">
        <span className="text-foreground-light">Did not get a code?</span>
        {canResend ? (
          <Button
            size="tiny"
            onClick={() => {
              setDeadline(Date.now() + WAIT)
              setCanResend(false)
            }}
          >
            Send a new code
          </Button>
        ) : (
          <Countdown
            title="Send again in"
            value={deadline}
            format="mm:ss"
            size="small"
            onFinish={() => setCanResend(true)}
            className="flex-row items-baseline gap-2"
          />
        )}
      </div>
    </div>
  )
}
