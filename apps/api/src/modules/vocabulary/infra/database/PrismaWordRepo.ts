import type { PrismaClient } from "@prisma/client";
import type { IWordRepository } from "../../repos/IWordRepository";
import type { Word } from "../../domain/Word";
import { WordMapper } from "../../mappers/WordMapper";

export class PrismaWordRepo implements IWordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Word | null> {
    const raw = await this.prisma.word.findUnique({
      where: { id },
      include: { examples: true }
    });
    if (!raw) return null;
    const mapped = WordMapper.toDomain(raw);
    if (mapped.isFailure) throw new Error(String(mapped.error));
    return mapped.getValue();
  }

  async findByUserIdAndText(userId: string, text: string): Promise<Word | null> {
    const raw = await this.prisma.word.findFirst({
      where: { userId, text },
      include: { examples: true }
    });
    if (!raw) return null;
    const mapped = WordMapper.toDomain(raw);
    if (mapped.isFailure) throw new Error(String(mapped.error));
    return mapped.getValue();
  }

  async listByUserId(userId: string): Promise<Word[]> {
    const raws = await this.prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { examples: true }
    });
    return raws.map((raw) => {
      const mapped = WordMapper.toDomain(raw);
      if (mapped.isFailure) throw new Error(String(mapped.error));
      return mapped.getValue();
    });
  }

  async save(word: Word): Promise<void> {
    const wordData = WordMapper.toPersistenceWordCreate(word);
    const incomingExampleIds = word.examples.map((e) => e.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.word.upsert({
        where: { id: word.id },
        create: wordData,
        update: {
          text: wordData.text,
          definition: wordData.definition,
          partOfSpeech: wordData.partOfSpeech,
          phonetic: wordData.phonetic,
          reviewCount: wordData.reviewCount,
          nextReviewAt: wordData.nextReviewAt
        }
      });

      const existing = await tx.wordExample.findMany({
        where: { wordId: word.id },
        select: { id: true }
      });
      const existingIds = new Set(existing.map((e) => e.id));
      const incomingIds = new Set(incomingExampleIds);
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

      if (toDelete.length > 0) {
        await tx.wordExample.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (const ex of word.examples) {
        await tx.wordExample.upsert({
          where: { id: ex.id },
          create: {
            id: ex.id,
            wordId: word.id,
            example: ex.example,
            translation: ex.translation
          },
          update: {
            example: ex.example,
            translation: ex.translation
          }
        });
      }
    });
  }

  async deleteByIdForUser(wordId: string, userId: string): Promise<boolean> {
    const res = await this.prisma.word.deleteMany({
      where: { id: wordId, userId }
    });
    return res.count > 0;
  }

  async countCreatedByUserIdBetween(userId: string, start: Date, end: Date): Promise<number> {
    return await this.prisma.word.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lt: end
        }
      }
    });
  }
}

