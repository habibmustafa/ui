import { Button, Input, Label, Popover } from '../../../src'

export default function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">Set limit</Button>
      </Popover.Trigger>
      <Popover.Content className="w-64 p-4" aria-label="Row limit settings">
        <div className="flex flex-col gap-2">
          <Label htmlFor="limit">Row limit</Label>
          <Input id="limit" defaultValue="1000" />
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}
