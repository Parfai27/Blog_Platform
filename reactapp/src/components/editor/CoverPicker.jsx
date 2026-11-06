import { useEffect, useId, useState } from "react"
import { checkImage, IMAGE_ACCEPT, LIMITS } from "../../lib/validation"

// The "Upload cover image" box from the Figma. Shows the saved cover, or the newly chosen file.
// onChange(file) gets the chosen File, or null when the choice is cleared.
export default function CoverPicker({ savedUrl, file, onChange }) {
  const id = useId()
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreview("")
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const take = (chosen) => {
    if (!chosen) return
    const problem = checkImage(chosen, LIMITS.coverMb)
    setError(problem)
    if (!problem) onChange(chosen)
  }

  const shown = preview || savedUrl

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          take(event.dataTransfer.files?.[0])
        }}
        className={`group relative flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          dragging ? "border-brand bg-brand-soft" : "border-line-strong bg-paper hover:border-brand"
        }`}
      >
        {shown ? (
          <>
            <img src={shown} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
            <span className="relative rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink opacity-0 shadow transition group-hover:opacity-100">
              Change cover image
            </span>
          </>
        ) : (
          <span className="px-4 text-center">
            <span className="block text-sm font-semibold text-ink">Upload cover image</span>
            <span className="mt-1 block text-xs text-subtle">
              Drop a photo here, or choose a file · JPEG, PNG, or WebP up to {LIMITS.coverMb} MB
            </span>
          </span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          take(event.target.files?.[0])
          event.target.value = ""
        }}
      />
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-danger">{error}</span>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="font-semibold text-muted hover:text-ink">
            {savedUrl ? "Keep the current cover" : "Remove"}
          </button>
        )}
      </div>
    </div>
  )
}
