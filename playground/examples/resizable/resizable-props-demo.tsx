import { Resizable } from '../../../src'

export default function ResizablePropsDemo() {
  return (
    <Resizable
      orientation="horizontal"
      className="max-w-md rounded-lg border"
      panels={[
        {
          defaultSize: 50,
          content: (
            <div className="flex h-50 items-center justify-center p-6">
              <span className="font-semibold">One</span>
            </div>
          ),
        },
        {
          defaultSize: 50,
          content: (
            <div className="flex h-50 items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          ),
        },
      ]}
    />
  )
}
