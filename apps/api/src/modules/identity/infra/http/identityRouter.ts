import { Router } from "express";
import type { CreateUserUseCase } from "../../useCases/createUser/CreateUserUseCase";

export function buildIdentityRouter(deps: { createUserUseCase: CreateUserUseCase }) {
  const router = Router();

  router.post("/users", async (req, res) => {
    try {
      const result = await deps.createUserUseCase.execute(req.body);
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res
        .status(500)
        .json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  return router;
}

