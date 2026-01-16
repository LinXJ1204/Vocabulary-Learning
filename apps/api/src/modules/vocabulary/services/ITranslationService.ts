export type TranslationResult = {
  definition: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
  example?: string | null;
  exampleTranslation?: string | null;
};

export interface ITranslationService {
  analyzeWord(text: string): Promise<TranslationResult>;
}

