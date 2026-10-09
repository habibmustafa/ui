import { useId, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
  Admonition,
  Badge,
  Button,
  Card,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  Dialog,
  Input,
  Kbd,
  Label,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  ToggleGroup,
  toast,
  type ChartConfig,
} from '../../src'

/*
 * What the theme builder previews: real components in the arrangements an app would
 * use them, covering every token the generator writes (brand scale, primary text,
 * accent/charts, neutrals, status colors, radius, both fonts). Elements marked with
 * data-contrast feed the builder's contrast checks.
 */

const chartData = [
  { month: 'Jan', plan: 186, actual: 120 },
  { month: 'Feb', plan: 305, actual: 260 },
  { month: 'Mar', plan: 237, actual: 250 },
  { month: 'Apr', plan: 273, actual: 190 },
  { month: 'May', plan: 209, actual: 230 },
  { month: 'Jun', plan: 314, actual: 280 },
]

const chartConfig = {
  plan: { label: 'Plan', color: 'var(--chart-1)' },
  actual: { label: 'Actual', color: 'var(--chart-2)' },
} satisfies ChartConfig

const invoices = [
  { id: 'INV-1042', customer: 'Habib Mustafa', status: 'paid', amount: '$1,240' },
  { id: 'INV-1041', customer: 'Olivia Martin', status: 'pending', amount: '$860' },
  { id: 'INV-1040', customer: 'Liam Chen', status: 'overdue', amount: '$2,115' },
] as const

const STATUS = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'destructive' },
} as const

function AccountCard() {
  const id = useId()
  return (
    <Card title="Account" description="Form controls and buttons.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input id={`${id}-name`} defaultValue="Habib Mustafa" />
        </div>
        <div className="flex flex-col gap-2">
          <Label id={`${id}-role`}>Role</Label>
          <Select
            aria-labelledby={`${id}-role`}
            defaultValue="editor"
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'editor', label: 'Editor' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </div>
        <RadioGroup
          aria-label="Notification frequency"
          defaultValue="daily"
          options={[
            { value: 'instant', label: 'Instantly' },
            { value: 'daily', label: 'Daily digest' },
          ]}
        />
        <div className="flex items-center gap-2">
          <Checkbox id={`${id}-terms`} defaultChecked />
          <Label htmlFor={`${id}-terms`}>Email me about product updates</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={`${id}-2fa`} defaultChecked />
          <Label htmlFor={`${id}-2fa`}>Two-factor sign-in</Label>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="primary" data-contrast="button">
            Save changes
          </Button>
          <Button variant="default">Cancel</Button>
          <Button variant="outline">Preview</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
    </Card>
  )
}

function RevenueCard() {
  return (
    <Card title="Revenue" description="Brand and accent colors in a chart.">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-foreground-lighter">This month</p>
            <p className="text-2xl tabular-nums text-foreground">$48,290</p>
          </div>
          <Badge variant="success">+12,4%</Badge>
        </div>
        <ChartContainer config={chartConfig} className="h-44 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="plan" fill="var(--color-plan)" radius={4} />
            <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-foreground-light">
            <span>Yearly target</span>
            <span className="tabular-nums">68%</span>
          </div>
          <Progress value={68} aria-label="Yearly target" />
        </div>
      </div>
    </Card>
  )
}

function TypographyCard() {
  return (
    <Card title="Text" description="Fonts and text colors.">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl tracking-tight text-foreground">Your report is ready</h3>
        <p className="text-sm text-foreground" data-contrast="text">
          Body text: quarterly results were shared with the team.
        </p>
        <p className="text-sm text-foreground-light" data-contrast="text-light">
          Secondary text: last updated 5 minutes ago.
        </p>
        <p className="text-xs text-foreground-lighter" data-contrast="text-lighter">
          Helper text: only visible to you.
        </p>
        <p className="text-sm">
          <a href="#theme-preview" className="text-primary underline underline-offset-2" data-contrast="primary">
            Open the report
          </a>
          <span className="text-foreground-light"> · </span>
          <span className="text-destructive" data-contrast="destructive">
            2 errors
          </span>
          <span className="text-foreground-light"> · </span>
          <span className="text-warning" data-contrast="warning">
            1 warning
          </span>
        </p>
        <p className="text-sm text-foreground-light">
          Search <Kbd>⌘</Kbd> <Kbd>K</Kbd>, code: <code className="font-mono text-foreground">createTheme()</code>
        </p>
      </div>
    </Card>
  )
}

function StatusCard() {
  return (
    <Card title="Notifications" description="Status colors, toast and dialog.">
      <div className="flex flex-col gap-3">
        <Admonition type="note" title="New version" description="Release 2.4 is ready to use." />
        <Admonition type="warning" title="Approaching your limit" description="You have used 90% of your plan." />
        <Admonition type="destructive" title="Payment failed" description="Update your card details." />
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="default"
            onClick={() => toast.success('Changes saved', { description: 'The theme now applies everywhere.' })}
          >
            Show toast
          </Button>
          <Dialog
            trigger={<Button variant="outline">Open dialog</Button>}
            title="Upgrade plan"
            description="The new plan starts with your next billing period."
            confirmText="Upgrade"
            cancelText="Cancel"
            onConfirm={() => new Promise((resolve) => setTimeout(resolve, 700))}
          />
        </div>
      </div>
    </Card>
  )
}

function InvoicesCard() {
  return (
    <Card title="Invoices" description="Tabs, table and badges.">
      <Tabs.Root defaultValue="all">
        <Tabs.List className="gap-5">
          <Tabs.Trigger value="all">All</Tabs.Trigger>
          <Tabs.Trigger value="open">Open</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        {(['all', 'open'] as const).map((tab) => (
          <Tabs.Content key={tab} value={tab}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Invoice</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Amount</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoices
                  .filter((invoice) => tab === 'all' || invoice.status !== 'paid')
                  .map((invoice) => (
                    <Table.Row key={invoice.id}>
                      <Table.Cell className="font-mono text-xs">{invoice.id}</Table.Cell>
                      <Table.Cell>{invoice.customer}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={STATUS[invoice.status].variant}>{STATUS[invoice.status].label}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{invoice.amount}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Card>
  )
}

function ControlsCard() {
  const [volume, setVolume] = useState([60])
  const [view, setView] = useState('week')
  return (
    <Card title="Controls" description="Slider, segmented choice and input.">
      <div className="flex flex-col gap-5">
        <ToggleGroup
          type="single"
          variant="segmented"
          tone="outline"
          allowDeselect={false}
          aria-label="Period"
          value={view}
          onValueChange={(value: string) => value && setView(value)}
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Volume</span>
            <span className="tabular-nums text-foreground-light">{volume[0]}%</span>
          </div>
          <Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
        </div>
        <Input aria-label="Search" placeholder="Search…" />
      </div>
    </Card>
  )
}

export function ThemePreview() {
  return (
    <div id="theme-preview" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AccountCard />
      <RevenueCard />
      <div className="flex flex-col gap-4">
        <TypographyCard />
        <ControlsCard />
      </div>
      <StatusCard />
      <div className="xl:col-span-2">
        <InvoicesCard />
      </div>
    </div>
  )
}
