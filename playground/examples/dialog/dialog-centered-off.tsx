import { Button, Dialog, Input, Label } from '../../../src'

export default function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-106.25" centered={false}>
        <Dialog.Header>
          <Dialog.Title>This dialog is not centered.</Dialog.Title>
          <Dialog.Description>This dialog is not centered.</Dialog.Description>
        </Dialog.Header>
        <Dialog.SectionSeparator />
        <Dialog.Section className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div>
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </Dialog.Section>
        <Dialog.Footer>
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
