import { cookies } from "next/headers";
import type { ApiResponse, WordDTO } from "@evb/shared-types";
import { SignInClient, WordsClient } from "./WordsClient";
import { Card, CardContent } from "../../components/ui/Card";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
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
  const jar = await cookies();
  const userId = jar.get("evb_user_id")?.value ?? "";
  const email = jar.get("evb_user_email")?.value ?? "";

  if (!userId) {
    return <SignInClient />;
  }

  const wordsRes = await listWords(userId);
  const words = wordsRes.ok ? wordsRes.data : [];

  if (!wordsRes.ok) {
    // Keep server rendering stable; client shows nicer UX for form errors.
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-sm text-danger">Failed to load: {wordsRes.error.message}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <WordsClient user={{ id: userId, email }} words={words} />;
}

