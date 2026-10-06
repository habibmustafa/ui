import { Switch } from '../../../src'

export default function SwitchStates() {
  return (
    <>
      <Switch aria-label="Off" />
      <Switch defaultChecked aria-label="On" />
      <Switch disabled aria-label="Disabled, off" />
      <Switch disabled defaultChecked aria-label="Disabled, on" />
    </>
  )
}
