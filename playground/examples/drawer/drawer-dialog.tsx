'use client'

import * as React from 'react'
import { Button, cn, Dialog, Drawer, Input, Label } from '../../../src'

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

export default function DrawerDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button variant="outline">Edit profile</Button>
        </Dialog.Trigger>
        <Dialog.Content className="sm:max-w-106.25">
          <Dialog.Header>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>
              Make changes to your profile here. Click save when you are done.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Section>
            <ProfileForm />
          </Dialog.Section>
        </Dialog.Content>
      </Dialog.Root>
    )
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline">Edit profile</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header className="text-left">
          <Drawer.Title>Edit profile</Drawer.Title>
          <Drawer.Description>
            Make changes to your profile here. Click save when you are done.
          </Drawer.Description>
        </Drawer.Header>
        <ProfileForm className="px-4" />
        <Drawer.Footer className="pt-2">
          <Drawer.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  )
}

function ProfileForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button variant="primary" type="submit">
        Save changes
      </Button>
    </form>
  )
}
