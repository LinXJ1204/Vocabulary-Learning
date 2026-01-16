import { Router } from "express";
import type { AddWordUseCase } from "../../useCases/addWord/AddWordUseCase";
import type { ListWordsUseCase } from "../../useCases/listWords/ListWordsUseCase";

export function buildVocabularyRouter(deps: {
  addWordUseCase: AddWordUseCase;
  listWordsUseCase: ListWordsUseCase;
}) {
  const router = Router();

  router.get("/words", async (req, res) => {
    try {
      const userId = String(req.query.userId ?? "");
      const result = await deps.listWordsUseCase.execute({ userId });
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res.status(500).json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  router.post("/words", async (req, res) => {
    try {
      const result = await deps.addWordUseCase.execute(req.body);
      if (result.ok) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (e) {
      return res.status(500).json({ ok: false, error: { message: "Internal error", details: e } });
    }
  });

  return router;
}

