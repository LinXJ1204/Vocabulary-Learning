export type GoogleProfile = {
  googleId: string;
  email: string;
};

export interface IGoogleOAuthService {
  getAuthUrl(params: { redirectUri: string; state?: string }): string;
  getProfileFromCode(params: {
    code: string;
    redirectUri: string;
  }): Promise<GoogleProfile>;
}

