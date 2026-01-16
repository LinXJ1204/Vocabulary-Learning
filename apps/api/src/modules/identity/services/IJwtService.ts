export type JwtPayload = { userId: string };

export interface IJwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload | null;
}

