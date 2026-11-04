import { Tabs } from '../../../src'

export default function TabsDemo() {
  return (
    <Tabs.Root defaultValue="table" className="w-100">
      <Tabs.List className="grid w-full grid-cols-3">
        <Tabs.Trigger value="table">Table</Tabs.Trigger>
        <Tabs.Trigger value="sql">SQL</Tabs.Trigger>
        <Tabs.Trigger value="policies">Policies</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="table" className="text-sm text-foreground-light">
        The table editor lives here.
      </Tabs.Content>
      <Tabs.Content value="sql" className="text-sm text-foreground-light">
        Run queries against the database.
      </Tabs.Content>
      <Tabs.Content value="policies" className="text-sm text-foreground-light">
        Row level security policies.
      </Tabs.Content>
    </Tabs.Root>
  )
}
