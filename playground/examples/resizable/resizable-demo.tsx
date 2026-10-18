import { Resizable } from '../../../src'

export default function ResizableDemo() {
  return (
    <Resizable.Root orientation="horizontal" className="max-w-md rounded-lg border">
      <Resizable.Panel defaultSize="50">
        <div className="flex h-50 items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </Resizable.Panel>
      <Resizable.Handle withHandle />
      <Resizable.Panel defaultSize="50">
        <Resizable.Root orientation="vertical">
          <Resizable.Panel defaultSize="25">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </Resizable.Panel>
          <Resizable.Handle withHandle />
          <Resizable.Panel defaultSize="75">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </Resizable.Panel>
        </Resizable.Root>
      </Resizable.Panel>
    </Resizable.Root>
  )
}
