import type { IWordRepository } from "../../repos/IWordRepository";
import type { DeleteWordRequest, DeleteWordResponse } from "./DeleteWordDTO";

export class DeleteWordUseCase {
  constructor(private readonly wordRepo: IWordRepository) {}

  public async execute(req: DeleteWordRequest): Promise<DeleteWordResponse> {
    const userId = req.userId?.trim();
    const wordId = req.wordId?.trim();
    if (!userId || !wordId) {
      return { ok: false, error: { message: "userId and wordId are required" } };
    }

    const deleted = await this.wordRepo.deleteByIdForUser(wordId, userId);
    if (!deleted) {
      return { ok: false, error: { message: "Word not found", code: "WORD_NOT_FOUND" } };
    }

    return { ok: true, data: { id: wordId } };
  }
}

