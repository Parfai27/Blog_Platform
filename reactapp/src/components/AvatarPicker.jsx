import { useEffect, useId, useRef, useState } from "react"
import { checkImage, IMAGE_ACCEPT, LIMITS } from "../lib/validation"
import Avatar from "./ui/Avatar"

// Shows the current photo (or initials) with a button to choose a new one.
// onChange(file) gets the chosen File, or null if the choice was not allowed.
export default function AvatarPicker({ person, file, onChange, error, label = "Profile photo", required = false }) {
  const id = useId()
  const input = useRef(null)
  const [preview, setPreview] = useState("")
  const [localError, setLocalError] = useState("")

  useEffect(() => {
    if (!file) {
      setPreview("")
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const choose = (event) => {
    const chosen = event.target.files?.[0]
    event.target.value = ""
    if (!chosen) return
    const problem = checkImage(chosen)
    setLocalError(problem)
    onChange(problem ? null : chosen)
  }

  const shown = localError || error

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </p>
      <div className="mt-2 flex items-center gap-4">
        {preview ? (
          <img src={preview} alt="New profile photo" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <Avatar person={person} size="picker" />
        )}
        <div>
          <input id={id} ref={input} type="file" accept={IMAGE_ACCEPT} onChange={choose} className="sr-only" />
          <label
            htmlFor={id}
            className="inline-flex cursor-pointer items-center rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink"
          >
            {file || person?.avatar ? "Change photo" : "Choose photo"}
          </label>
          <p className="mt-1 text-xs text-subtle">JPEG, PNG, or WebP, up to {LIMITS.avatarMb} MB</p>
        </div>
      </div>
      {shown && <p className="mt-1 text-xs text-danger">{shown}</p>}
    </div>
  )
}
