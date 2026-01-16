"use server";

import type { ApiResponse, MeResponseDTO, WordDTO } from "@evb/shared-types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

export type ActionState<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const cookieHeader = jar.toString();
  await fetch(`${apiBaseUrl()}/auth/logout`, {
    method: "POST",
    headers: { cookie: cookieHeader },
    cache: "no-store"
  });
  revalidatePath("/words");
}

export async function addWordAction(
  _prev: ActionState<WordDTO> | undefined,
  formData: FormData
): Promise<ActionState<WordDTO>> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { ok: false, error: "Word is required" };

  const jar = await cookies();
  const cookieHeader = jar.toString();

  const res = await fetch(`${apiBaseUrl()}/vocabulary/words`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieHeader },
    body: JSON.stringify({ text }),
    cache: "no-store"
  });

  const json = (await res.json()) as ApiResponse<WordDTO>;
  if (!json.ok) return { ok: false, error: json.error.message };

  revalidatePath("/words");
  return { ok: true, data: json.data };
}

export async function deleteWordAction(
  wordId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = wordId?.trim();
  if (!id) return { ok: false, error: "缺少 wordId" };

  const jar = await cookies();
  const cookieHeader = jar.toString();

  const url = `${apiBaseUrl()}/vocabulary/words/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { cookie: cookieHeader },
    cache: "no-store"
  });

  const json = (await res.json()) as ApiResponse<{ id: string }>;
  if (!json.ok) return { ok: false, error: json.error.message };

  revalidatePath("/words");
  return { ok: true };
}

export async function meAction(): Promise<ApiResponse<MeResponseDTO>> {
  const jar = await cookies();
  const cookieHeader = jar.toString();
  const res = await fetch(`${apiBaseUrl()}/identity/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store"
  });
  return (await res.json()) as ApiResponse<MeResponseDTO>;
}

