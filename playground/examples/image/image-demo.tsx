import { Image } from '../../../src'

export default function ImageDemo() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <Image
        src="/ui-mark.svg"
        alt="ui mark"
        preview
        aspectRatio={1}
        wrapperClassName="w-32"
        fit="contain"
      />
      <Image
        src="https://example.invalid/missing.png"
        alt="Missing image"
        aspectRatio={1}
        wrapperClassName="w-32"
      />
      <Image
        src="https://example.invalid/missing.png"
        alt="Profile photo"
        fallback="HM"
        radius="full"
        aspectRatio={1}
        wrapperClassName="w-16 text-sm font-medium"
      />
    </div>
  )
}
