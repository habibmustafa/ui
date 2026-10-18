import { useState } from 'react'

import { Button, Dialog, Label, MultiSelector } from '../../../src'

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

export default function MultiSelectInDialogPropsDemo() {
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  return (
    <Dialog
      trigger={<Button>Open</Button>}
      title="Choose your fruits"
      description="Select the fruits you like."
      slotProps={{ content: { className: 'sm:max-w-106.25' } }}
      footer={<Button variant="primary">Save changes</Button>}
    >
      <div>
        <Label htmlFor="multi-select-in-dialog-fruits">Fruits</Label>
        <MultiSelector
          id="multi-select-in-dialog-fruits"
          values={selectedValues}
          onValuesChange={setSelectedValues}
          options={fruits.map(({ value, isDisabled }) => ({ value, disabled: isDisabled }))}
          label="Select fruits"
          badgeLimit="wrap"
        />
      </div>
    </Dialog>
  )
}
