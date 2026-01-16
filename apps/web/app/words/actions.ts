"use server";

import type {
  AddWordRequestDTO,
  ApiResponse,
  CreateUserRequestDTO,
  UserDTO,
  WordDTO
} from "@evb/shared-types";
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

export async function ensureUserAction(
  _prev: ActionState<UserDTO> | undefined,
  formData: FormData
): Promise<ActionState<UserDTO>> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Email is required" };

  const payload: CreateUserRequestDTO = { email };
  const res = await fetch(`${apiBaseUrl()}/identity/users`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const json = (await res.json()) as ApiResponse<UserDTO>;
  if (!json.ok) return { ok: false, error: json.error.message };

  const jar = await cookies();
  jar.set("evb_user_id", json.data.id, { path: "/", sameSite: "lax" });
  jar.set("evb_user_email", json.data.email, { path: "/", sameSite: "lax" });

  revalidatePath("/words");
  return { ok: true, data: json.data };
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete("evb_user_id");
  jar.delete("evb_user_email");
  revalidatePath("/words");
}

export async function addWordAction(
  _prev: ActionState<WordDTO> | undefined,
  formData: FormData
): Promise<ActionState<WordDTO>> {
  const jar = await cookies();
  const userId = jar.get("evb_user_id")?.value ?? "";
  if (!userId) return { ok: false, error: "Please sign in first" };

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { ok: false, error: "Word is required" };

  const payload: AddWordRequestDTO = { userId, text };
  const res = await fetch(`${apiBaseUrl()}/vocabulary/words`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
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
  const jar = await cookies();
  const userId = jar.get("evb_user_id")?.value ?? "";
  if (!userId) return { ok: false, error: "請先登入" };

  const id = wordId?.trim();
  if (!id) return { ok: false, error: "缺少 wordId" };

  const url = `${apiBaseUrl()}/vocabulary/words/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, { method: "DELETE", cache: "no-store" });

  const json = (await res.json()) as ApiResponse<{ id: string }>;
  if (!json.ok) return { ok: false, error: json.error.message };

  revalidatePath("/words");
  return { ok: true };
}

