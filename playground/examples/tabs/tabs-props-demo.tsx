import { Tabs } from '../../../src'

export default function TabsPropsDemo() {
  return (
    <Tabs
      defaultValue="table"
      className="w-100"
      classNames={{ content: 'text-sm text-foreground-light' }}
      items={[
        { value: 'table', label: 'Table', content: 'The table editor lives here.' },
        { value: 'sql', label: 'SQL', content: 'Run queries against the database.' },
        { value: 'policies', label: 'Policies', content: 'Row level security policies.' },
      ]}
    />
  )
}
