import type { Prisma, Word as PrismaWord, WordExample as PrismaWordExample } from "@prisma/client";
import { Result } from "../../../shared/core/Result";
import { Word } from "../domain/Word";

export type PrismaWordWithExamples = PrismaWord & { examples?: PrismaWordExample[] };

export class WordMapper {
  public static toDomain(raw: PrismaWordWithExamples): Result<Word> {
    return Word.create(
      {
        userId: raw.userId,
        text: raw.text,
        info: {
          definition: raw.definition,
          partOfSpeech: raw.partOfSpeech,
          phonetic: raw.phonetic
        },
        examples: (raw.examples ?? []).map((ex) => ({
          id: ex.id,
          example: ex.example,
          translation: ex.translation
        })),
        stats: {
          reviewCount: raw.reviewCount,
          nextReviewDate: raw.nextReviewAt
        },
        createdAt: raw.createdAt
      },
      raw.id
    );
  }

  public static toPersistenceWordCreate(word: Word): Prisma.WordUncheckedCreateInput {
    return {
      id: word.id,
      userId: word.userId,
      text: word.text,
      definition: word.info.definition,
      partOfSpeech: word.info.partOfSpeech,
      phonetic: word.info.phonetic,
      reviewCount: word.stats.reviewCount,
      nextReviewAt: word.stats.nextReviewDate,
      createdAt: word.createdAt
    };
  }
}

