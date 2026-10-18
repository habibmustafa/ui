import { Resizable } from '../../../src'

export default function ResizableDemo() {
  return (
    <Resizable.Root
      orientation="horizontal"
      className="min-h-50 max-w-md rounded-lg border"
    >
      <Resizable.Panel defaultSize="25">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </Resizable.Panel>
      <Resizable.Handle withHandle />
      <Resizable.Panel defaultSize="75">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </Resizable.Panel>
    </Resizable.Root>
  )
}
