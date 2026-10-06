import { Switch } from '../../../src'

export default function SwitchSizes() {
  return (
    <>
      <Switch size="small" defaultChecked aria-label="Small switch" />
      <Switch size="medium" defaultChecked aria-label="Medium switch" />
      <Switch size="large" defaultChecked aria-label="Large switch" />
    </>
  )
}
