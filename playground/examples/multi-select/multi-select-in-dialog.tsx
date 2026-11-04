import { useState } from 'react'
import { Button, Dialog, Label, MultiSelector } from '../../../src'

export default function MultiSelectDemo() {
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  const fruits = [
    { value: 'Apple', isDisabled: false },
    { value: 'Banana', isDisabled: false },
    { value: 'Cherry', isDisabled: false },
    { value: 'Date', isDisabled: false },
    { value: 'Elderberrie', isDisabled: false },
    { value: 'Fig', isDisabled: false },
    { value: 'Grape', isDisabled: false },
    { value: 'Kiwi', isDisabled: true },
    { value: 'Mango', isDisabled: false },
    { value: 'Strawberry', isDisabled: false },
  ]

  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content className="sm:max-w-106.25">
        <Dialog.Header>
          <Dialog.Title>Choose your fruits</Dialog.Title>
          <Dialog.Description>Select the fruits you like.</Dialog.Description>
        </Dialog.Header>
        <Dialog.SectionSeparator />
        <Dialog.Section className="space-y-4">
          <div>
            <Label htmlFor="fruits">Fruits</Label>
            <MultiSelector.Root id="fruits" values={selectedValues} onValuesChange={setSelectedValues}>
              <MultiSelector.Trigger label="Select fruits" badgeLimit="wrap" />
              <MultiSelector.Content>
                <MultiSelector.List>
                  {fruits.map(({ value, isDisabled }) => (
                    <MultiSelector.Item key={value} value={value} disabled={isDisabled}>
                      {value}
                    </MultiSelector.Item>
                  ))}
                </MultiSelector.List>
              </MultiSelector.Content>
            </MultiSelector.Root>
          </div>
        </Dialog.Section>
        <Dialog.Footer>
          <Button variant="primary">Save changes</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
