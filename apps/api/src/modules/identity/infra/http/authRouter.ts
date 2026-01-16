import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { IUserRepository } from "../../repos/IUserRepository";
import type { IGoogleOAuthService } from "../../services/IGoogleOAuthService";
import type { IJwtService } from "../../services/IJwtService";
import { User } from "../../domain/User";

function safeReturnTo(webBaseUrl: string, returnTo?: string): string {
  const fallback = `${webBaseUrl.replace(/\/$/, "")}/words`;
  if (!returnTo) return fallback;
  try {
    const u = new URL(returnTo);
    const base = new URL(webBaseUrl);
    if (u.origin !== base.origin) return fallback;
    return u.toString();
  } catch {
    // allow relative path
    if (returnTo.startsWith("/")) return `${webBaseUrl.replace(/\/$/, "")}${returnTo}`;
    return fallback;
  }
}

export function buildAuthRouter(deps: {
  apiBaseUrl: string;
  webBaseUrl: string;
  googleOAuth: IGoogleOAuthService;
  googleConfigured: boolean;
  userRepo: IUserRepository;
  jwt: IJwtService;
}) {
  const router = Router();

  router.get("/google", (req, res) => {
    if (!deps.googleConfigured) {
      return res
        .status(500)
        .send(
          "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in apps/api/.env, then restart the API."
        );
    }

    const redirectUri = `${deps.apiBaseUrl.replace(/\/$/, "")}/auth/google/callback`;
    const returnTo = safeReturnTo(deps.webBaseUrl, String(req.query.returnTo ?? ""));
    const state = JSON.stringify({ returnTo, nonce: randomUUID() });
    const url = deps.googleOAuth.getAuthUrl({ redirectUri, state });
    res.redirect(url);
  });

  router.get("/google/callback", async (req, res) => {
    try {
      if (!deps.googleConfigured) {
        return res
          .status(500)
          .send(
            "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in apps/api/.env, then restart the API."
          );
      }

      const code = String(req.query.code ?? "");
      const stateRaw = String(req.query.state ?? "");
      if (!code) return res.status(400).send("Missing code");

      let returnTo = `${deps.webBaseUrl.replace(/\/$/, "")}/words`;
      try {
        const parsed = JSON.parse(stateRaw) as { returnTo?: string };
        returnTo = safeReturnTo(deps.webBaseUrl, parsed.returnTo);
      } catch {
        // ignore
      }

      const redirectUri = `${deps.apiBaseUrl.replace(/\/$/, "")}/auth/google/callback`;
      const profile = await deps.googleOAuth.getProfileFromCode({ code, redirectUri });

      // Find existing user
      let user =
        (await deps.userRepo.findByGoogleId(profile.googleId)) ??
        (await deps.userRepo.findByEmail(profile.email.toLowerCase()));

      if (!user) {
        const created = User.create({
          email: profile.email,
          googleId: profile.googleId,
          role: "user"
        });
        if (created.isFailure) throw new Error(String(created.error));
        user = created.getValue();
      } else {
        // Link googleId if missing
        if (!user.googleId) user.linkGoogleAccount(profile.googleId);
      }

      await deps.userRepo.save(user);

      const token = deps.jwt.sign({ userId: user.id });

      res.cookie("evb_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
      });

      return res.redirect(returnTo);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).send("Auth failed");
    }
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie("evb_session", { path: "/" });
    return res.json({ ok: true });
  });

  // Browser-friendly logout (e.g. from web app): clears cookie then redirects back.
  router.get("/logout", (req, res) => {
    const returnTo = safeReturnTo(deps.webBaseUrl, String(req.query.returnTo ?? ""));
    res.clearCookie("evb_session", { path: "/" });
    return res.redirect(returnTo);
  });

  return router;
}

