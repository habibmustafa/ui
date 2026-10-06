import { DataInput } from '../../../src'

export default function DataInputWithCopySecret() {
  const actualValue = 'sb_secret_1234567890'
  const maskedValue = 'sb_secret_123•••••••'

  return (
    <DataInput
      aria-label="Secret key"
      containerClassName="w-full max-w-sm"
      readOnly
      copy
      value={maskedValue}
      onCopy={() => {
        navigator.clipboard.writeText(actualValue)
      }}
    />
  )
}
