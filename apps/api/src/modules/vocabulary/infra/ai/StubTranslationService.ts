import type { ITranslationService, TranslationResult } from "../../services/ITranslationService";

export class StubTranslationService implements ITranslationService {
  async analyzeWord(text: string): Promise<TranslationResult> {
    const t = text.trim();
    return {
      definition: `Definition of "${t}" (stub)`,
      partOfSpeech: null,
      phonetic: null,
      example: `Example sentence with "${t}" (stub).`,
      exampleTranslation: `「${t}」的例句（stub）。`
    };
  }
}

