import { useState } from 'react'

import { Menubar } from '../../../src'

export default function MenubarDemo() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [zoom, setZoom] = useState('100')

  return (
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>
            New tab <Menubar.Shortcut>⌘T</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item>
            New window <Menubar.Shortcut>⌘N</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Sub>
            <Menubar.SubTrigger>Share</Menubar.SubTrigger>
            <Menubar.SubContent>
              <Menubar.Item>Email link</Menubar.Item>
              <Menubar.Item>Copy link</Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
          <Menubar.Separator />
          <Menubar.Item>
            Print… <Menubar.Shortcut>⌘P</Menubar.Shortcut>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>
            Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item disabled>
            Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.CheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
            Status bar
          </Menubar.CheckboxItem>
          <Menubar.Separator />
          <Menubar.Label>Zoom</Menubar.Label>
          <Menubar.RadioGroup value={zoom} onValueChange={setZoom}>
            <Menubar.RadioItem value="75">75%</Menubar.RadioItem>
            <Menubar.RadioItem value="100">100%</Menubar.RadioItem>
            <Menubar.RadioItem value="150">150%</Menubar.RadioItem>
          </Menubar.RadioGroup>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  )
}
