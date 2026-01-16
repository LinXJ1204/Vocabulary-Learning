import type { AddWordResponse, AddWordRequest } from "./AddWordDTO";
import type { IWordRepository } from "../../repos/IWordRepository";
import type { ITranslationService } from "../../services/ITranslationService";
import { Word } from "../../domain/Word";
import type { IUserRepository } from "../../../identity/repos/IUserRepository";

export class AddWordUseCase {
  constructor(
    private readonly wordRepo: IWordRepository,
    private readonly translationService: ITranslationService,
    private readonly userRepo: IUserRepository
  ) {}

  public async execute(req: AddWordRequest): Promise<AddWordResponse> {
    const userId = req.userId?.trim();
    const text = req.text?.trim();
    if (!userId || !text) {
      return { ok: false, error: { message: "userId and text are required" } };
    }

    // Ensure referenced user exists (DB enforces FK Word.userId -> User.id).
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      return {
        ok: false,
        error: { message: "User not found", code: "USER_NOT_FOUND" }
      };
    }

    // Daily quota (UTC)
    const limit = Number(process.env.DAILY_ADD_LIMIT ?? "30");
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const todayCount = await this.wordRepo.countCreatedByUserIdBetween(userId, start, end);
    if (todayCount >= limit) {
      return {
        ok: false,
        error: { message: `Daily limit exceeded (${limit})`, code: "QUOTA_EXCEEDED" }
      };
    }

    const existing = await this.wordRepo.findByUserIdAndText(userId, text);
    if (existing) {
      return { ok: false, error: { message: "Word already exists", code: "WORD_DUPLICATE" } };
    }

    const analysis = await this.translationService.analyzeWord(text);

    const wordOrError = Word.create({
      userId,
      text,
      info: {
        definition: analysis.definition,
        partOfSpeech: analysis.partOfSpeech ?? null,
        phonetic: analysis.phonetic ?? null
      },
      examples:
        analysis.example && analysis.exampleTranslation
          ? [{ example: analysis.example, translation: analysis.exampleTranslation }]
          : []
    });

    if (wordOrError.isFailure) {
      return { ok: false, error: { message: String(wordOrError.error ?? "Invalid word") } };
    }

    const word = wordOrError.getValue();
    try {
      await this.wordRepo.save(word);
    } catch (e) {
      return {
        ok: false,
        error: { message: "Failed to save word", code: "WORD_SAVE_FAILED", details: e }
      };
    }

    return {
      ok: true,
      data: {
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
      }
    };
  }
}

