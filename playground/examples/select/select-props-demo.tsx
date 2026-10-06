import { Select } from '../../../src'

export default function SelectPropsDemo() {
  return (
    <Select
      defaultValue="postgres"
      className="max-w-xs"
      aria-label="Database"
      placeholder="Pick a database"
      options={[
        { value: 'postgres', label: 'Postgres' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'redis', label: 'Redis' },
        { value: 'mongo', label: 'MongoDB', disabled: true },
      ]}
    />
  )
}
