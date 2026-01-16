import jwt from "jsonwebtoken";
import type { IJwtService, JwtPayload } from "../../services/IJwtService";

export class JwtService implements IJwtService {
  constructor(private readonly secret: string) {}

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: "7d" });
  }

  verify(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      if (!decoded?.userId) return null;
      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }
}

