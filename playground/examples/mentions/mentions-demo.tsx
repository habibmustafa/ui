import { Mentions } from '../../../src'

const people = [
  { value: 'ada', label: 'Ada Lovelace', description: 'Engineering' },
  { value: 'grace', label: 'Grace Hopper', description: 'Compilers' },
  { value: 'linus', label: 'Linus Torvalds', description: 'Kernel' },
  { value: 'margaret', label: 'Margaret Hamilton', description: 'Flight software', disabled: true },
]

export default function MentionsDemo() {
  return (
    <div className="w-full max-w-md">
      <Mentions
        aria-label="Comment"
        placeholder="Type @ to mention someone"
        rows={3}
        options={people}
        defaultValue="Thanks @ada for the review. "
      />
    </div>
  )
}
