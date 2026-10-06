'use client'

import * as React from 'react'

import { InputOTP } from '../../../src'

export default function InputOTPControlledPropsDemo() {
  const [value, setValue] = React.useState('')

  return (
    <div className="space-y-2">
      <InputOTP aria-label="One-time code" slots={6} value={value} onChange={(value) => setValue(value)} />
      <div className="text-center text-sm">
        {value === '' ? <>Enter your one-time password.</> : <>You entered: {value}</>}
      </div>
    </div>
  )
}
