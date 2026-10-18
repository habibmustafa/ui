import { Resizable } from '../../../src'

export default function ResizableHandlePropsDemo() {
  return (
    <Resizable
      orientation="horizontal"
      className="min-h-50 max-w-md rounded-lg border"
      panels={[
        {
          defaultSize: '25',
          content: (
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Sidebar</span>
            </div>
          ),
        },
        {
          defaultSize: '75',
          content: (
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Content</span>
            </div>
          ),
        },
      ]}
    />
  )
}
