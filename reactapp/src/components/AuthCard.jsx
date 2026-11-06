// The white card on a light background used by the sign-up, login, and reset pages.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="bg-paper px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mx-auto mt-5 max-w-md text-center text-sm text-muted">{footer}</div>}
    </div>
  )
}
