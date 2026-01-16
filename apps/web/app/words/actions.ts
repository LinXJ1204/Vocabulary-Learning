"use server";

import type { ApiResponse, MeResponseDTO, WordDTO } from "@evb/shared-types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

const WORD_TEXT_MAX_LENGTH = 20;

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
  if (text.length > WORD_TEXT_MAX_LENGTH) {
    return { ok: false, error: `最多 ${WORD_TEXT_MAX_LENGTH} 個字元` };
  }

  const jar = await cookies();
  const cookieHeader = jar.toString();

  try {
    const res = await fetch(`${apiBaseUrl()}/vocabulary/words`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({ text }),
      cache: "no-store"
    });

    // Always guard JSON parsing to avoid Next action "Internal error" when API is down / returns HTML.
    let json: ApiResponse<WordDTO> | null = null;
    try {
      json = (await res.json()) as ApiResponse<WordDTO>;
    } catch {
      return { ok: false, error: `API 回應格式錯誤（HTTP ${res.status}）` };
    }

    if (!json.ok) return { ok: false, error: json.error.message };

    revalidatePath("/words");
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, error: `無法連線到 API：${String((e as Error)?.message ?? e)}` };
  }
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

