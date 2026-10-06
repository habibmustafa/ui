import { Kbd, KbdGroup } from '../../../src'

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-sm text-foreground-light">
      <p className="flex items-center gap-2">
        Open the command menu with
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
      <p className="flex items-center gap-2">
        Save with
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>S</Kbd>
        </KbdGroup>
      </p>
      <div className="flex items-center gap-2">
        <Kbd size="small">Esc</Kbd>
        <Kbd size="medium">Enter</Kbd>
        <Kbd size="large">Shift</Kbd>
      </div>
    </div>
  )
}
