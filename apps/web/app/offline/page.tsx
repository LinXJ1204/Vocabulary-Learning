import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">目前離線</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          你目前沒有網路連線，因此無法載入單字清單或呼叫 API。請連上網路後再試一次。
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/words"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primaryForeground hover:bg-primary/90"
          >
            回到 Words
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}

