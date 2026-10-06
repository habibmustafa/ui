import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button, MultiSelector } from '../../../src'

export default function MultiSelectDemo() {
  const [selectedValues, setSelectedValues] = useState<string[]>(['Apple', 'Banana', 'Cherry'])
  const [limit, setLimit] = useState(2)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Button size="tiny" onClick={() => setLimit(limit - 1)} disabled={limit < 1} aria-label="Decrease limit">
          <Minus size={12} aria-hidden="true" />
        </Button>
        <span className="text-sm text-foreground/90 peer-checked:line-through font-semibold hover:cursor-pointer">
          Limit: {limit}
        </span>
        <Button size="tiny" onClick={() => setLimit(limit + 1)} aria-label="Increase limit">
          <Plus size={12} aria-hidden="true" />
        </Button>
      </div>
      <MultiSelector.Root values={selectedValues} onValuesChange={setSelectedValues}>
        <MultiSelector.Trigger className="w-72" label="Select fruits" badgeLimit={limit} />
        <MultiSelector.Content>
          <MultiSelector.List>
            <MultiSelector.Item value="Apple">Apple</MultiSelector.Item>
            <MultiSelector.Item value="Banana">Banana</MultiSelector.Item>
            <MultiSelector.Item value="Cherry">Cherry</MultiSelector.Item>
            <MultiSelector.Item value="Date">Date</MultiSelector.Item>
            <MultiSelector.Item value="Elderberrie">Elderberrie</MultiSelector.Item>
            <MultiSelector.Item value="Fig">Fig</MultiSelector.Item>
            <MultiSelector.Item value="Grape">Grape</MultiSelector.Item>
            <MultiSelector.Item value="Kiwi">Kiwi</MultiSelector.Item>
            <MultiSelector.Item value="Mango">Mango</MultiSelector.Item>
            <MultiSelector.Item value="Strawberry">Strawberry</MultiSelector.Item>
          </MultiSelector.List>
        </MultiSelector.Content>
      </MultiSelector.Root>
    </div>
  )
}
