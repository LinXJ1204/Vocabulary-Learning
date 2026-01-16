import { headers } from "next/headers";
import { redirect } from "next/navigation";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

export default async function LogoutPage() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const webBaseUrl = `${proto}://${host}`;

  const returnTo = `${stripTrailingSlash(webBaseUrl)}/words`;
  const url = `${stripTrailingSlash(apiBaseUrl())}/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
  redirect(url);
}

