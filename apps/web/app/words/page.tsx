import type { AddWordRequestDTO, ApiResponse, WordDTO } from "@evb/shared-types";
import { redirect } from "next/navigation";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

async function addWord(formData: FormData) {
  "use server";

  const payload: AddWordRequestDTO = {
    userId: String(formData.get("userId") ?? ""),
    text: String(formData.get("text") ?? "")
  };

  const res = await fetch(`${apiBaseUrl()}/vocabulary/words`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const json = (await res.json()) as ApiResponse<WordDTO>;
  if (json.ok) {
    redirect(`/words?userId=${encodeURIComponent(payload.userId)}`);
  }
  return json;
}

async function listWords(userId: string): Promise<ApiResponse<WordDTO[]>> {
  const res = await fetch(
    `${apiBaseUrl()}/vocabulary/words?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" }
  );
  return (await res.json()) as ApiResponse<WordDTO[]>;
}

export default async function WordsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const userIdParam = searchParams.userId;
  const userId = Array.isArray(userIdParam)
    ? userIdParam[0] ?? "demo-user-id"
    : userIdParam ?? "demo-user-id";

  const wordsRes = await listWords(userId);
  const words = wordsRes.ok ? wordsRes.data : [];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <h1>Words</h1>
      <p>
        Using <code>userId</code>: <code>{userId}</code>
      </p>

      <form
        action={addWord}
        style={{ display: "grid", gap: 12, marginTop: 16 }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>User ID</span>
          <input name="userId" defaultValue={userId} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Word</span>
          <input name="text" placeholder="hello" />
        </label>
        <button type="submit">Add word</button>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 12 }}>List</h2>
        {!wordsRes.ok ? (
          <p style={{ color: "crimson" }}>
            Failed to load: {wordsRes.error.message}
          </p>
        ) : words.length === 0 ? (
          <p>No words yet.</p>
        ) : (
          <ul style={{ display: "grid", gap: 10, paddingLeft: 18 }}>
            {words.map((w) => (
              <li key={w.id}>
                <div style={{ fontWeight: 600 }}>{w.text}</div>
                <div>{w.info.definition}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  createdAt: {w.createdAt}
                  {w.stats.nextReviewDate ? ` • nextReview: ${w.stats.nextReviewDate}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

