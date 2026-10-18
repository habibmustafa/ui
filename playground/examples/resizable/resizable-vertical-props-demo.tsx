import { Resizable } from '../../../src'

export default function ResizableVerticalPropsDemo() {
  return (
    <Resizable
      orientation="vertical"
      className="min-h-50 max-w-md rounded-lg border"
      withHandle={false}
      panels={[
        {
          defaultSize: '25',
          content: (
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Header</span>
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
