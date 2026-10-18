import { Resizable } from '../../../src'

export default function ResizableDemo() {
  return (
    <Resizable.Root
      orientation="vertical"
      className="min-h-50 max-w-md rounded-lg border"
    >
      <Resizable.Panel defaultSize="25">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize="75">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </Resizable.Panel>
    </Resizable.Root>
  )
}
