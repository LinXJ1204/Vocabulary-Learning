import { Router } from "express";
import type { AddWordUseCase } from "../../useCases/addWord/AddWordUseCase";
import type { ListWordsUseCase } from "../../useCases/listWords/ListWordsUseCase";
import type { DeleteWordUseCase } from "../../useCases/deleteWord/DeleteWordUseCase";
import type { IJwtService } from "../../../identity/services/IJwtService";
import type { AuthedRequest } from "../../../../shared/http/authMiddleware";
import { requireAuth } from "../../../../shared/http/authMiddleware";

export function buildVocabularyRouter(deps: {
  addWordUseCase: AddWordUseCase;
  listWordsUseCase: ListWordsUseCase;
  deleteWordUseCase: DeleteWordUseCase;
  jwt: IJwtService;
}) {
  const router = Router();

  router.get("/words", requireAuth(deps.jwt), async (req: AuthedRequest, res) => {
    try {
      const userId = req.userId!;
      const result = await deps.listWordsUseCase.execute({ userId });
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res.status(500).json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  router.post("/words", requireAuth(deps.jwt), async (req: AuthedRequest, res) => {
    try {
      const userId = req.userId!;
      const result = await deps.addWordUseCase.execute({ userId, text: req.body?.text });
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res.status(500).json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  router.delete("/words/:id", requireAuth(deps.jwt), async (req: AuthedRequest, res) => {
    try {
      const wordId = String(req.params.id ?? "");
      const userId = req.userId!;
      const result = await deps.deleteWordUseCase.execute({ userId, wordId });
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res.status(500).json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  return router;
}

