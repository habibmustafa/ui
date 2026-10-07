import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button, MultiSelector } from '../../../src'

const fruitOptions = [
  { value: 'Apple' },
  { value: 'Banana' },
  { value: 'Cherry' },
  { value: 'Date' },
  { value: 'Elderberrie' },
  { value: 'Fig' },
  { value: 'Grape' },
  { value: 'Kiwi' },
  { value: 'Mango' },
  { value: 'Strawberry' },
]

export default function MultiSelectBadgeLimitPropsDemo() {
  const [selectedValues, setSelectedValues] = useState<string[]>(['Apple', 'Banana', 'Cherry'])
  const [limit, setLimit] = useState(2)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Button size="tiny" onClick={() => setLimit((value) => value - 1)} disabled={limit < 1} aria-label="Decrease limit">
          <Minus size={12} aria-hidden="true" />
        </Button>
        <span className="text-sm font-semibold text-foreground/90">Limit: {limit}</span>
        <Button size="tiny" onClick={() => setLimit((value) => value + 1)} aria-label="Increase limit">
          <Plus size={12} aria-hidden="true" />
        </Button>
      </div>
      <MultiSelector
        values={selectedValues}
        onValuesChange={setSelectedValues}
        options={fruitOptions}
        triggerClassName="w-72"
        label="Select fruits"
        badgeLimit={limit}
      />
    </div>
  )
}
