import { Router } from "express";
import type { IUserRepository } from "../../repos/IUserRepository";
import type { IJwtService } from "../../services/IJwtService";
import type { AuthedRequest } from "../../../../shared/http/authMiddleware";
import { requireAuth } from "../../../../shared/http/authMiddleware";

export function buildMeRouter(deps: { userRepo: IUserRepository; jwt: IJwtService }) {
  const router = Router();

  router.get("/me", requireAuth(deps.jwt), async (req: AuthedRequest, res) => {
    const userId = req.userId!;
    const user = await deps.userRepo.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: { message: "User not found" } });

    return res.json({ ok: true, data: { id: user.id, email: user.email, role: user.role } });
  });

  return router;
}

