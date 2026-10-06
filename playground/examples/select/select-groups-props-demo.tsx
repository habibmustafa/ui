import { Select } from '../../../src'

export default function SelectGroupsPropsDemo() {
  return (
    <Select
      defaultValue="postgres"
      className="max-w-xs"
      aria-label="Database"
      placeholder="Pick a database"
      groups={[
        {
          label: 'Relational',
          options: [
            { value: 'postgres', label: 'Postgres' },
            { value: 'mysql', label: 'MySQL' },
          ],
        },
        {
          label: 'Other',
          options: [
            { value: 'redis', label: 'Redis' },
            { value: 'mongo', label: 'MongoDB', disabled: true },
          ],
        },
      ]}
    />
  )
}
