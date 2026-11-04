import { Dialog, Input, Label, Button } from '../../../src'

export default function DialogCenteredOffPropsDemo() {
  return (
    <Dialog
      trigger={<Button>This dialog is not centered.</Button>}
      title="This dialog is not centered."
      description="This dialog is not centered."
      slotProps={{ content: { centered: false, className: 'sm:max-w-106.25' } }}
      footer={
        <Button variant="primary" type="submit">
          Save changes
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="dialog-centered-off-name" className="text-right">
            Name
          </Label>
          <Input id="dialog-centered-off-name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div>
          <Label htmlFor="dialog-centered-off-username" className="text-right">
            Username
          </Label>
          <Input
            id="dialog-centered-off-username"
            defaultValue="@peduarte"
            className="col-span-3"
          />
        </div>
      </div>
    </Dialog>
  )
}
