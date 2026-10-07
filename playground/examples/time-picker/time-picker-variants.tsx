import { TimePicker } from '../../../src'

export default function TimePickerVariants() {
  return (
    <div className="flex flex-col items-center gap-3">
      <TimePicker aria-label="Meeting time (12-hour)" hourCycle={12} defaultValue="14:45" minuteStep={15} />
      <TimePicker aria-label="Precise time" showSeconds defaultValue="23:59:30" />
      <TimePicker aria-label="Empty time" />
      <TimePicker aria-label="Disabled time" defaultValue="08:00" disabled />
    </div>
  )
}
