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
 * accent/charts, neutrals, status colours, radius, both fonts). Elements marked with
 * data-contrast feed the builder's contrast checks.
 */

const chartData = [
  { month: 'Yan', plan: 186, actual: 120 },
  { month: 'Fev', plan: 305, actual: 260 },
  { month: 'Mar', plan: 237, actual: 250 },
  { month: 'Apr', plan: 273, actual: 190 },
  { month: 'May', plan: 209, actual: 230 },
  { month: 'İyn', plan: 314, actual: 280 },
]

const chartConfig = {
  plan: { label: 'Plan', color: 'var(--chart-1)' },
  actual: { label: 'Faktiki', color: 'var(--chart-2)' },
} satisfies ChartConfig

const invoices = [
  { id: 'INV-1042', customer: 'Aysel Məmmədova', status: 'paid', amount: '1 240 ₼' },
  { id: 'INV-1041', customer: 'Kamran Əliyev', status: 'pending', amount: '860 ₼' },
  { id: 'INV-1040', customer: 'Nigar Həsənli', status: 'overdue', amount: '2 115 ₼' },
] as const

const STATUS = {
  paid: { label: 'Ödənilib', variant: 'success' },
  pending: { label: 'Gözləyir', variant: 'warning' },
  overdue: { label: 'Gecikib', variant: 'destructive' },
} as const

function AccountCard() {
  const id = useId()
  return (
    <Card title="Hesab" description="Forma elementləri və düymələr.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name`}>Ad</Label>
          <Input id={`${id}-name`} defaultValue="Aysel Məmmədova" />
        </div>
        <div className="flex flex-col gap-2">
          <Label id={`${id}-role`}>Rol</Label>
          <Select
            aria-labelledby={`${id}-role`}
            defaultValue="editor"
            options={[
              { value: 'viewer', label: 'İzləyici' },
              { value: 'editor', label: 'Redaktor' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </div>
        <RadioGroup
          aria-label="Bildiriş tezliyi"
          defaultValue="daily"
          options={[
            { value: 'instant', label: 'Dərhal' },
            { value: 'daily', label: 'Gündəlik xülasə' },
          ]}
        />
        <div className="flex items-center gap-2">
          <Checkbox id={`${id}-terms`} defaultChecked />
          <Label htmlFor={`${id}-terms`}>Yeniliklər haqqında e-poçt al</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={`${id}-2fa`} defaultChecked />
          <Label htmlFor={`${id}-2fa`}>İki mərhələli giriş</Label>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="primary" data-contrast="button">
            Yadda saxla
          </Button>
          <Button variant="default">Ləğv et</Button>
          <Button variant="outline">Önizlə</Button>
          <Button variant="danger">Sil</Button>
        </div>
      </div>
    </Card>
  )
}

function RevenueCard() {
  return (
    <Card title="Gəlir" description="Brend və vurğu rəngləri qrafikdə.">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-foreground-lighter">Bu ay</p>
            <p className="text-2xl tabular-nums text-foreground">48 290 ₼</p>
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
            <span>İllik hədəf</span>
            <span className="tabular-nums">68%</span>
          </div>
          <Progress value={68} aria-label="İllik hədəf" />
        </div>
      </div>
    </Card>
  )
}

function TypographyCard() {
  return (
    <Card title="Mətn" description="Şriftlər və mətn rəngləri.">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl tracking-tight text-foreground">Hesabat hazırdır</h3>
        <p className="text-sm text-foreground" data-contrast="text">
          Əsas mətn: rüblük nəticələr komanda ilə paylaşıldı.
        </p>
        <p className="text-sm text-foreground-light" data-contrast="text-light">
          İkinci dərəcəli mətn: son yeniləmə 5 dəqiqə əvvəl.
        </p>
        <p className="text-xs text-foreground-lighter" data-contrast="text-lighter">
          Köməkçi mətn: yalnız sizə görünür.
        </p>
        <p className="text-sm">
          <a href="#theme-preview" className="text-primary underline underline-offset-2" data-contrast="primary">
            Hesabata keçid
          </a>
          <span className="text-foreground-light"> · </span>
          <span className="text-destructive" data-contrast="destructive">
            2 xəta
          </span>
          <span className="text-foreground-light"> · </span>
          <span className="text-warning" data-contrast="warning">
            1 xəbərdarlıq
          </span>
        </p>
        <p className="text-sm text-foreground-light">
          Axtarış <Kbd>⌘</Kbd> <Kbd>K</Kbd>, kod: <code className="font-mono text-foreground">createTheme()</code>
        </p>
      </div>
    </Card>
  )
}

function StatusCard() {
  return (
    <Card title="Bildirişlər" description="Status rəngləri, toast və dialoq.">
      <div className="flex flex-col gap-3">
        <Admonition type="note" title="Yeni versiya" description="2.4 buraxılışı istifadəyə hazırdır." />
        <Admonition type="warning" title="Limitə yaxınsınız" description="Planın 90%-i istifadə olunub." />
        <Admonition type="destructive" title="Ödəniş alınmadı" description="Kart məlumatlarını yeniləyin." />
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="default"
            onClick={() => toast.success('Dəyişikliklər yadda saxlanıldı', { description: 'Tema hər yerdə tətbiq olunur.' })}
          >
            Toast göstər
          </Button>
          <Dialog
            trigger={<Button variant="outline">Dialoq aç</Button>}
            title="Planı yenilə"
            description="Yeni plan növbəti ödəniş dövründən başlayır."
            confirmText="Yenilə"
            cancelText="Ləğv et"
            onConfirm={() => new Promise((resolve) => setTimeout(resolve, 700))}
          />
        </div>
      </div>
    </Card>
  )
}

function InvoicesCard() {
  return (
    <Card title="Fakturalar" description="Tab, cədvəl və badge.">
      <Tabs.Root defaultValue="all">
        <Tabs.List className="gap-5">
          <Tabs.Trigger value="all">Hamısı</Tabs.Trigger>
          <Tabs.Trigger value="open">Açıq</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        {(['all', 'open'] as const).map((tab) => (
          <Tabs.Content key={tab} value={tab}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Faktura</Table.Head>
                  <Table.Head>Müştəri</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-right">Məbləğ</Table.Head>
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
    <Card title="İdarəetmə" description="Slider, seçim qrupu, giriş sahəsi.">
      <div className="flex flex-col gap-5">
        <ToggleGroup
          type="single"
          variant="segmented"
          tone="outline"
          allowDeselect={false}
          aria-label="Dövr"
          value={view}
          onValueChange={(value: string) => value && setView(value)}
          items={[
            { value: 'day', label: 'Gün' },
            { value: 'week', label: 'Həftə' },
            { value: 'month', label: 'Ay' },
          ]}
        />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Səs</span>
            <span className="tabular-nums text-foreground-light">{volume[0]}%</span>
          </div>
          <Slider aria-label="Səs" value={volume} onValueChange={setVolume} />
        </div>
        <Input aria-label="Axtarış" placeholder="Axtar…" />
      </div>
    </Card>
  )
}

export function ThemePreview() {
  return (
    <div id="theme-preview" className="grid gap-4 xl:grid-cols-2">
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
