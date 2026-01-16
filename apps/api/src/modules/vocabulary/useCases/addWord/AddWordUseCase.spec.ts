import { describe, expect, it } from "vitest";
import type { ITranslationService } from "../../services/ITranslationService";
import type { IWordRepository } from "../../repos/IWordRepository";
import { AddWordUseCase } from "./AddWordUseCase";
import type { IUserRepository } from "../../../identity/repos/IUserRepository";

class InMemoryWordRepo implements IWordRepository {
  private words: Array<{ userId: string; text: string }> = [];
  private count = 0;

  async findById(): Promise<any> {
    return null;
  }

  async findByUserIdAndText(userId: string, text: string): Promise<any> {
    return this.words.find((w) => w.userId === userId && w.text === text) ?? null;
  }

  async listByUserId(): Promise<any[]> {
    return [];
  }

  async save(word: any): Promise<void> {
    this.words.push({ userId: word.userId, text: word.text });
    this.count += 1;
  }

  async deleteByIdForUser(): Promise<boolean> {
    return false;
  }

  async countCreatedByUserIdBetween(): Promise<number> {
    return this.count;
  }
}

class FakeTranslationService implements ITranslationService {
  async analyzeWord(text: string) {
    return {
      definition: `${text} definition`,
      partOfSpeech: "noun",
      phonetic: "/x/",
      example: `example ${text}`,
      exampleTranslation: `翻譯 ${text}`
    };
  }
}

class InMemoryUserRepo implements IUserRepository {
  private ids = new Set<string>();

  async findById(id: string): Promise<any> {
    return this.ids.has(id) ? ({ id } as any) : null;
  }

  async findByEmail(): Promise<any> {
    return null;
  }

  async findByGoogleId(): Promise<any> {
    return null;
  }

  async save(user: any): Promise<void> {
    this.ids.add(user.id);
  }

  seed(id: string) {
    this.ids.add(id);
  }
}

describe("AddWordUseCase (no infra)", () => {
  it("rejects duplicate word", async () => {
    const repo = new InMemoryWordRepo();
    const svc = new FakeTranslationService();
    const userRepo = new InMemoryUserRepo();
    userRepo.seed("u1");
    const uc = new AddWordUseCase(repo, svc, userRepo);

    const r1 = await uc.execute({ userId: "u1", text: "hello" });
    expect(r1.ok).toBe(true);

    const r2 = await uc.execute({ userId: "u1", text: "hello" });
    expect(r2.ok).toBe(false);
  });
});

