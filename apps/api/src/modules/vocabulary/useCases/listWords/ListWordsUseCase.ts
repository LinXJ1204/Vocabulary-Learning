import type { WordDTO } from "@evb/shared-types";
import type { IWordRepository } from "../../repos/IWordRepository";
import type { ListWordsRequest, ListWordsResponse } from "./ListWordsDTO";

export class ListWordsUseCase {
  constructor(private readonly wordRepo: IWordRepository) {}

  public async execute(req: ListWordsRequest): Promise<ListWordsResponse> {
    const userId = req.userId?.trim();
    if (!userId) return { ok: false, error: { message: "userId is required" } };

    const words = await this.wordRepo.listByUserId(userId);
    const dto: WordDTO[] = words.map((word) => ({
      id: word.id,
      userId: word.userId,
      text: word.text,
      info: {
        definition: word.info.definition,
        partOfSpeech: word.info.partOfSpeech,
        phonetic: word.info.phonetic
      },
      examples: word.examples.map((ex) => ({
        id: ex.id,
        example: ex.example,
        translation: ex.translation
      })),
      stats: {
        reviewCount: word.stats.reviewCount,
        nextReviewDate: word.stats.nextReviewDate
          ? word.stats.nextReviewDate.toISOString()
          : null
      },
      createdAt: word.createdAt.toISOString()
    }));

    return { ok: true, data: dto };
  }
}

