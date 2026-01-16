import type { Word } from "../domain/Word";

export interface IWordRepository {
  findById(id: string): Promise<Word | null>;
  findByUserIdAndText(userId: string, text: string): Promise<Word | null>;
  listByUserId(userId: string): Promise<Word[]>;
  save(word: Word): Promise<void>;
  deleteByIdForUser(wordId: string, userId: string): Promise<boolean>;
  countCreatedByUserIdBetween(userId: string, start: Date, end: Date): Promise<number>;
}

