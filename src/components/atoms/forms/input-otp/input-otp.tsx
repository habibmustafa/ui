/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for InputOTP — Strategy A, discriminator
 * `slots`. Not present upstream. `slots` sets `maxLength` internally and auto-renders that
 * many `InputOTPSlot`s (optionally split into `InputOTPSeparator`-divided groups of
 * `groupSize`), the way most consumers actually use OTPInput.
 */
import * as React from 'react'

import {
  InputOTPGroup,
  InputOTPRoot,
  InputOTPSeparator,
  InputOTPSlot,
} from './input-otp-parts'

// With ref: React 19 passes `ref` through this function component to InputOTPRoot.
type RootProps = React.ComponentPropsWithRef<typeof InputOTPRoot>

type InputOTPPropsMode = Omit<RootProps, 'children' | 'maxLength' | 'render'> & {
  /** Number of character slots. Sets the underlying `maxLength`. */
  slots: number
  /** Splits the slots into groups of this size, divided by an InputOTPSeparator. */
  groupSize?: number
  children?: never
}

type InputOTPCompoundProps = RootProps & { slots?: never }

export type InputOTPProps = InputOTPPropsMode | InputOTPCompoundProps

export function InputOTPHybrid(props: InputOTPProps) {
  if (props.slots === undefined) {
    return <InputOTPRoot {...props} />
  }

  const { slots, groupSize, ...rootProps } = props

  const groupSizes: number[] = []
  if (groupSize && groupSize > 0) {
    for (let remaining = slots; remaining > 0; remaining -= groupSize) {
      groupSizes.push(Math.min(groupSize, remaining))
    }
  } else {
    groupSizes.push(slots)
  }

  let index = 0

  return (
    <InputOTPRoot maxLength={slots} {...rootProps}>
      {groupSizes.map((size, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && <InputOTPSeparator />}
          <InputOTPGroup>
            {Array.from({ length: size }, () => {
              const slotIndex = index
              index += 1
              return <InputOTPSlot key={slotIndex} index={slotIndex} />
            })}
          </InputOTPGroup>
        </React.Fragment>
      ))}
    </InputOTPRoot>
  )
}
