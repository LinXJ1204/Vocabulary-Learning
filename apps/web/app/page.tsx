export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <section className="space-y-5">
          <p className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs text-mutedForeground shadow-sm">
            DDD • Next.js • Express • Prisma • Gemini
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Learn vocabulary with a clean domain model.
          </h1>
          <p className="text-mutedForeground">
            Save words, keep examples, and review with a spaced repetition schedule. AI analysis is
            pluggable (stub or Gemini).
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/words"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primaryForeground hover:bg-primary/90"
            >
              Open Words
            </a>
            <a
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-muted"
            >
              Docs (coming soon)
            </a>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold tracking-tight">What you can do now</h2>
          <ul className="mt-4 space-y-3 text-sm text-mutedForeground">
            <li>
              - Sign in with email (create-or-get user) and store your session in cookies
            </li>
            <li>
              - Add words and view your list
            </li>
            <li>
              - Switch translation provider via env: stub ↔ Gemini
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

