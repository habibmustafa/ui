import {
  Select,
} from '../../../src'

export default function SelectGroups() {
  return (
    <Select.Root defaultValue="postgres">
      <Select.Trigger className="max-w-xs" aria-label="Database">
        <Select.Value placeholder="Pick a database" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Relational</Select.Label>
          <Select.Item value="postgres">Postgres</Select.Item>
          <Select.Item value="mysql">MySQL</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Other</Select.Label>
          <Select.Item value="redis">Redis</Select.Item>
          <Select.Item value="mongo" disabled>
            MongoDB
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  )
}
