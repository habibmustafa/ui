import { Slider } from '../../../src'

export default function SliderSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider size="small" defaultValue={[25]} aria-label="Small slider" />
      <Slider size="medium" defaultValue={[50]} aria-label="Medium slider" />
      <Slider size="large" defaultValue={[75]} aria-label="Large slider" />
      <Slider defaultValue={[50]} disabled aria-label="Disabled slider" />
    </div>
  )
}
