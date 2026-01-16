export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <section className="rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight">AI English Vocabulary Builder</h1>
            <p className="text-sm text-mutedForeground">
              精簡介紹：快速記錄單字，自動生成中文釋義與例句，隨時回顧你的清單。
            </p>
          </div>
          <a
            href="/words"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primaryForeground shadow-sm transition-colors hover:bg-primary/90"
          >
            Launch
          </a>
        </div>
      </section>
    </main>
  );
}

