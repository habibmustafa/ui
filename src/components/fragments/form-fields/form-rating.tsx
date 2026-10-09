import { FormField } from '../../atoms/forms/form'
import { Rating, type RatingProps } from '../../atoms/forms/rating'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl, focusDescendant } from './field-shared'

export interface FormRatingProps
  extends Omit<RatingProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is the rating as a number (`0` when unrated). */
export function FormRating({ name, ...props }: FormRatingProps) {
  const [layoutProps, ratingProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <Rating
                {...ratingProps}
                ref={focusDescendant(field.ref, '[role="radio"]')}
                aria-labelledby={labelId}
                value={field.value ?? 0}
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
