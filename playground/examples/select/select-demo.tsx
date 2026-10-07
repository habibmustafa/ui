import {
  Select,
} from '../../../src'

export default function SelectDemo() {
  return (
    <Select.Root defaultValue="postgres">
      <Select.Trigger className="max-w-xs" aria-label="Database">
        <Select.Value placeholder="Pick a database" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="postgres">Postgres</Select.Item>
        <Select.Item value="mysql">MySQL</Select.Item>
        <Select.Item value="redis">Redis</Select.Item>
        <Select.Item value="mongo" disabled>
          MongoDB
        </Select.Item>
      </Select.Content>
    </Select.Root>
  )
}
