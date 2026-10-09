import { useState } from 'react'

import { Badge, Button, Checkbox, NumberInput, Switch, Table, toast, type TableColumn } from '../../src'

interface Product {
  id: string
  name: string
  sku: string
  price: number | null
  stock: number | null
  active: boolean
}

const saved: Product[] = [
  { id: 'p1', name: 'Field tee', sku: 'TEE-OLV-M', price: 28, stock: 140, active: true },
  { id: 'p2', name: 'Steel bottle', sku: 'BTL-750-K', price: 24, stock: 62, active: true },
  { id: 'p3', name: 'Trail backpack', sku: 'BAG-28-G', price: 96, stock: 18, active: true },
  { id: 'p4', name: 'Wool socks', sku: 'SOC-WOL-L', price: 14, stock: 0, active: false },
]

export default function PriceEditor() {
  const [baseline, setBaseline] = useState(saved)
  const [rows, setRows] = useState(saved)
  const [selected, setSelected] = useState<string[]>([])

  const update = (id: string, patch: Partial<Product>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const isChanged = (row: Product) => JSON.stringify(row) !== JSON.stringify(baseline.find((item) => item.id === row.id))
  const changedCount = rows.filter(isChanged).length
  const allSelected = selected.length === rows.length

  const columns: TableColumn<Product>[] = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={allSelected ? true : selected.length > 0 ? 'indeterminate' : false}
          onCheckedChange={(checked) => setSelected(checked === true ? rows.map((row) => row.id) : [])}
          aria-label="Select all products"
        />
      ),
      render: (row) => (
        <Checkbox
          checked={selected.includes(row.id)}
          onCheckedChange={(checked) => setSelected((current) => (checked === true ? [...current, row.id] : current.filter((id) => id !== row.id)))}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="flex flex-col">
          <span className="flex items-center gap-2 font-medium text-foreground">
            {row.name}
            {isChanged(row) && (
              <Badge variant="warning" className="px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                Edited
              </Badge>
            )}
          </span>
          <span className="font-mono text-xs text-foreground-lighter">{row.sku}</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price, $',
      align: 'right',
      render: (row) => (
        <NumberInput
          aria-label={`${row.name} price`}
          value={row.price}
          onValueChange={(price) => update(row.id, { price })}
          min={0}
          step={1}
          className="ml-auto w-28"
        />
      ),
    },
    {
      key: 'stock',
      header: 'In stock',
      align: 'right',
      render: (row) => (
        <NumberInput
          aria-label={`${row.name} stock`}
          value={row.stock}
          onValueChange={(stock) => update(row.id, { stock })}
          min={0}
          step={1}
          className="ml-auto w-28"
        />
      ),
    },
    {
      key: 'active',
      header: 'For sale',
      align: 'right',
      render: (row) => <Switch checked={row.active} onCheckedChange={(active) => update(row.id, { active })} aria-label={`${row.name} for sale`} />,
    },
  ]

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Prices and stock</h3>
          <p className="text-sm text-foreground-light">Edit the numbers in place, then save them all at once.</p>
        </div>
        <div className="flex gap-2">
          <Button disabled={selected.length === 0} onClick={() => setRows((current) => current.map((row) => (selected.includes(row.id) ? { ...row, active: false } : row)))}>
            Take {selected.length || ''} off sale
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto rounded-lg border">
          <Table columns={columns} data={rows} rowKey={(row) => row.id} caption="Products" classNames={{ caption: 'sr-only' }} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-surface-75 px-6 py-3.5">
        <p className="text-sm text-foreground-light" aria-live="polite">
          {changedCount === 0 ? 'No changes yet.' : `${changedCount} ${changedCount === 1 ? 'product' : 'products'} changed.`}
        </p>
        <div className="flex gap-2">
          <Button disabled={changedCount === 0} onClick={() => setRows(baseline)}>
            Discard
          </Button>
          <Button
            variant="primary"
            disabled={changedCount === 0}
            onClick={() => {
              setBaseline(rows)
              toast.success('Prices and stock saved')
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
