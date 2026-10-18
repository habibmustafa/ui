'use client'

import * as React from 'react'

import { Button, Dialog, Drawer, Input, Label } from '../../../src'

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

function ProfileForm({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid items-start gap-4">
        <div className="grid gap-2">
          <Label htmlFor="drawer-dialog-props-email">Email</Label>
          <Input type="email" id="drawer-dialog-props-email" defaultValue="shadcn@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="drawer-dialog-props-username">Username</Label>
          <Input id="drawer-dialog-props-username" defaultValue="@shadcn" />
        </div>
      </div>
    </div>
  )
}

export default function DrawerDialogPropsDemo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="outline">Edit profile</Button>}
        title="Edit profile"
        description="Make changes to your profile here. Click save when you are done."
        slotProps={{ content: { className: 'sm:max-w-106.25' } }}
        footer={<Button variant="primary">Save changes</Button>}
      >
        <ProfileForm />
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="outline">Edit profile</Button>}
      title="Edit profile"
      description="Make changes to your profile here. Click save when you are done."
      classNames={{ header: 'text-left', footer: 'pt-2' }}
      footer={({ close }) => (
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
      )}
    >
      <ProfileForm className="px-4" />
    </Drawer>
  )
}
