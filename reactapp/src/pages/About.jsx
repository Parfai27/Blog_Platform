import Button from "../components/ui/Button"
import { useAuth } from "../context/auth-context"
import { usePageTitle } from "../lib/usePageTitle"

const POINTS = [
  {
    title: "Read widely",
    text: "Stories from everyday life in Kigali and beyond: the bus ride, the market, the farm, the first week of learning to code.",
  },
  {
    title: "Write in your own voice",
    text: "Every member can write. Save a draft, come back to it, and publish when it is ready. Nothing is public until you say so.",
  },
  {
    title: "An assistant, not a ghostwriter",
    text: "The AI assistant suggests titles, a summary, tags, or a clearer paragraph. You choose what to keep. It never writes the post for you.",
  },
  {
    title: "Kind by default",
    text: "Comment on and like the stories you enjoy. If something crosses a line, report it and an admin will take a look.",
  },
]

export default function About() {
  const { user } = useAuth()
  usePageTitle("About")

  return (
    <div>
      <section className="bg-paper px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">About Open Margin</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
            Everyday lives, written in the margins.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            Open Margin is a community blog. Read widely, write in your own voice, and leave the margin open for the
            next person.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-2xl border border-line p-6">
              <h2 className="font-serif text-2xl text-ink">{point.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-line px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-3xl text-ink">Contact</h2>
            <p className="mt-2 text-sm text-muted">Gasabo, Kigali, Rwanda</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button to="/write">Write a post</Button>
            ) : (
              <>
                <Button to="/register">Join Open Margin</Button>
                <Button to="/blogs" variant="secondary">
                  Browse stories
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
