import { Combobox } from '../../../src'

export default function ComboboxGroups() {
  return (
    <Combobox
      aria-label="Region"
      className="max-w-xs"
      defaultValue="frankfurt"
      groups={[
        {
          label: 'Europe',
          options: [
            { value: 'frankfurt', label: 'Frankfurt', keywords: ['germany'] },
            { value: 'london', label: 'London', keywords: ['england'] },
          ],
        },
        {
          label: 'Americas',
          options: [
            { value: 'virginia', label: 'North Virginia', keywords: ['usa'] },
            { value: 'saopaulo', label: 'São Paulo', keywords: ['brazil'] },
          ],
        },
      ]}
    />
  )
}
