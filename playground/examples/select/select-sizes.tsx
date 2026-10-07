import { Select } from '../../../src'

export default function SelectSizes() {
  return (
    <div className="flex w-full flex-col gap-3">
      {(['tiny', 'small', 'medium', 'large', 'xlarge'] as const).map((size) => (
        <Select.Root key={size}>
          <Select.Trigger size={size} className="max-w-xs" aria-label={`${size} select`}>
            <Select.Value placeholder={size} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
            <Select.Item value="b">Option B</Select.Item>
          </Select.Content>
        </Select.Root>
      ))}
    </div>
  )
}
