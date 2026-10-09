import { FormField } from '../../atoms/forms/form'
import { Slider, type SliderProps } from '../../atoms/forms/slider'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl, focusDescendant } from './field-shared'

export interface FormSliderProps
  extends Omit<SliderProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is a `number[]` — one entry per thumb, so two values make a range. */
export function FormSlider({ name, ...props }: FormSliderProps) {
  const [layoutProps, sliderProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <Slider
                {...sliderProps}
                ref={focusDescendant(field.ref, '[role="slider"]')}
                aria-labelledby={labelId}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
