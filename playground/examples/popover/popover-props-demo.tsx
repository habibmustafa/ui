import { Button, Input, Label, Popover } from '../../../src'

export default function PopoverPropsDemo() {
  return (
    <Popover
      trigger={<Button variant="outline">Set limit</Button>}
      className="w-64 p-4"
      slotProps={{ content: { 'aria-label': 'Row limit settings' } }}
      content={
        <div className="flex flex-col gap-2">
          <Label htmlFor="limit">Row limit</Label>
          <Input id="limit" defaultValue="1000" />
        </div>
      }
    />
  )
}
