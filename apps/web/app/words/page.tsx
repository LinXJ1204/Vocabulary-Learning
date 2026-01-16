import { cookies } from "next/headers";
import type { ApiResponse, WordDTO } from "@evb/shared-types";
import { SignInClient, WordsClient } from "./WordsClient";
import { Card, CardContent } from "../../components/ui/Card";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

export default async function WordsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const jar = await cookies();
  const cookieHeader = jar.toString();
  const loginUrl = `${apiBaseUrl()}/auth/google`;

  const meRes = await fetch(`${apiBaseUrl()}/identity/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store"
  });

  if (meRes.status === 401) {
    return <SignInClient loginUrl={loginUrl} />;
  }

  const meJson = (await meRes.json()) as ApiResponse<{ id: string; email: string }>;
  if (!meJson.ok) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-sm text-danger">Failed to load user: {meJson.error.message}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const wordsRes = await fetch(`${apiBaseUrl()}/vocabulary/words`, {
    headers: { cookie: cookieHeader },
    cache: "no-store"
  });
  const wordsJson = (await wordsRes.json()) as ApiResponse<WordDTO[]>;
  if (!wordsJson.ok) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardContent>
            <p className="text-sm text-danger">Failed to load: {wordsJson.error.message}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <WordsClient user={{ id: meJson.data.id, email: meJson.data.email }} words={wordsJson.data} />;
}

