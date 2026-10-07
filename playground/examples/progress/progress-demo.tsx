import { Progress } from '../../../src'

export default function ProgressDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Progress value={15} aria-label="Upload 1" />
      <Progress value={50} aria-label="Upload 2" />
      <Progress value={90} aria-label="Upload 3" />
    </div>
  )
}
