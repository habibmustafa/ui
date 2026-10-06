import { Select } from '../../../src'

export default function SelectSizesPropsDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      {(['tiny', 'small', 'medium', 'large', 'xlarge'] as const).map((size) => (
        <Select
          key={size}
          size={size}
          placeholder={size}
          className="max-w-xs"
          aria-label={`${size} select`}
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
        />
      ))}
    </div>
  )
}
