import * as React from 'react'
import type { RefCallBack } from 'react-hook-form'
import { FormControl, useFormField } from '../../atoms/forms/form'
import { type MultiSelectorOption, type MultiSelectorProps } from '../../atoms/forms/multi-select'

/**
 * The label/description/layout knobs every field shares, hand-picked from FormItemLayout's
 * own prop type rather than reusing it wholesale — FormItemLayout's type also carries every
 * native `<div>` attribute (`onAbort` etc.), and intersecting that with an atom's own native
 * element attributes (`<input>`, `<textarea>`) produces an unsatisfiable event-handler type.
 */
export interface LayoutProps {
  label?: React.ReactNode
  description?: React.ReactNode
  labelOptional?: React.ReactNode
  align?: 'left' | 'right'
  layout?: 'horizontal' | 'vertical' | 'flex' | 'flex-row-reverse'
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
  labelLayout?: 'horizontal' | 'vertical'
}

export type FieldLayoutProps = Omit<LayoutProps, 'size'>

export function splitLayout<T extends FieldLayoutProps>(props: T) {
  const { label, description, labelOptional, align, layout, labelLayout, ...rest } = props
  return [{ label, description, labelOptional, align, layout, labelLayout }, rest] as const
}

/**
 * FormControl that also hands its render function the label's id, for controls a
 * `<label for>` can't name — a role="group" of segments, slider thumbs, a trigger button
 * nested inside the element that gets FormControl's `id`. `undefined` when the field has
 * no label, so nothing ever points at a missing element.
 */
export function LabelledControl({
  labelled,
  children,
}: {
  labelled: boolean
  children: (labelId: string | undefined) => React.ReactElement
}) {
  const { formLabelId } = useFormField()
  return <FormControl>{children(labelled ? formLabelId : undefined)}</FormControl>
}

/**
 * react-hook-form focuses the first invalid field through `field.ref(el).focus()`. For a
 * control whose ref'd element isn't itself focusable, register a stand-in that focuses
 * the first matching descendant instead.
 */
export const focusDescendant = (ref: RefCallBack, selector: string) => (el: HTMLElement | null) => {
  if (el) ref({ focus: () => el.querySelector<HTMLElement>(selector)?.focus() })
}

export type MultiSelectorOptionsProps = Extract<
  MultiSelectorProps,
  { options: readonly MultiSelectorOption[] }
>
