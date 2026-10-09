import { MessageSquareHeart } from 'lucide-react'
import { useId, useState } from 'react'

import { Button, Rating, Result, Slider, Textarea } from '../../src'

const verdict = (score: number) => (score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor')

export default function FeedbackSurvey() {
  const likelyId = useId()
  const [score, setScore] = useState([8])
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="w-full max-w-lg rounded-xl border bg-surface-100 p-8 shadow-sm">
        <Result
          status="success"
          size="small"
          level={3}
          title="Thanks for telling us"
          description="We read every answer. If you left a comment, we may write back."
          extra={
            <Button
              onClick={() => {
                setSent(false)
                setStars(0)
                setComment('')
              }}
            >
              Send another answer
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setSent(true)
      }}
      className="w-full max-w-lg overflow-hidden rounded-xl border bg-surface-100 shadow-sm"
    >
      <div className="flex items-start gap-3 border-b px-6 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-default/15 text-brand-600">
          <MessageSquareHeart className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">How are we doing?</h3>
          <p className="mt-0.5 text-sm text-foreground-light">Two quick questions. It takes under a minute.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span id={likelyId} className="font-medium text-foreground">
              How likely are you to recommend us to a colleague?
            </span>
            <span className="shrink-0 tabular-nums text-foreground">{score[0]} / 10</span>
          </div>
          <Slider value={score} onValueChange={setScore} min={0} max={10} step={1} aria-labelledby={likelyId} />
          <div className="flex justify-between text-xs text-foreground-lighter">
            <span>Not likely</span>
            <span aria-live="polite">{verdict(score[0])}</span>
            <span>Very likely</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">How would you rate the product?</span>
          <Rating aria-label="Product rating" value={stars} onValueChange={setStars} allowClear />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="survey-comment" className="text-sm font-medium text-foreground">
            Anything we should change?
          </label>
          <Textarea id="survey-comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Optional" />
        </div>
      </div>

      <div className="flex justify-end border-t bg-surface-75 px-6 py-3.5">
        <Button type="submit" variant="primary" disabled={stars === 0}>
          Send feedback
        </Button>
      </div>
    </form>
  )
}
