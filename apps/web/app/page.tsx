export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
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

