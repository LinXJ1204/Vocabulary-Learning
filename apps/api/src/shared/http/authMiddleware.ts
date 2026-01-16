import type { NextFunction, Request, Response } from "express";
import type { IJwtService } from "../../modules/identity/services/IJwtService";

export type AuthedRequest = Request & { userId?: string };

export function requireAuth(jwt: IJwtService) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.evb_session;
    if (!token) return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });

    const decoded = jwt.verify(token);
    if (!decoded) return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });

    req.userId = decoded.userId;
    next();
  };
}

