import { OAuth2Client } from "google-auth-library";
import type { GoogleProfile, IGoogleOAuthService } from "../../services/IGoogleOAuthService";

export class GoogleOAuthService implements IGoogleOAuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {
    this.client = new OAuth2Client(this.clientId, this.clientSecret);
  }

  getAuthUrl(params: { redirectUri: string; state?: string }): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      redirect_uri: params.redirectUri,
      state: params.state
    });
  }

  async getProfileFromCode(params: {
    code: string;
    redirectUri: string;
  }): Promise<GoogleProfile> {
    const { tokens } = await this.client.getToken({
      code: params.code,
      redirect_uri: params.redirectUri
    });

    if (!tokens.id_token) throw new Error("Missing id_token");

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.clientId
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) throw new Error("Missing google sub");
    if (!payload.email) throw new Error("Missing email");

    return { googleId: payload.sub, email: payload.email };
  }
}

