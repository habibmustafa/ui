import { Rating } from '../../../src'

export default function RatingReadOnly() {
  return (
    <div className="flex items-center gap-2">
      <Rating readOnly allowHalf value={4.5} size="small" aria-label="Average rating" />
      <span className="text-sm text-foreground-light">4.5 (128 reviews)</span>
    </div>
  )
}
