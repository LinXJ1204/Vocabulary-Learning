import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ITranslationService, TranslationResult } from "../../services/ITranslationService";

export class GeminiTranslationService implements ITranslationService {
  private readonly genAI: any;

  constructor(private readonly apiKey: string, private readonly modelName = "gemini-2.0-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeWord(text: string): Promise<TranslationResult> {
    const t = text.trim();
    if (!t) throw new Error("text is required");

    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = [
      "You are an English vocabulary analyzer.",
      "Given a single English word, return a compact JSON object with keys:",
      'definition (string), partOfSpeech (string|null), phonetic (string|null), example (string|null), exampleTranslation (string|null).',
      "Requirements:",
      "- definition must be in Traditional Chinese (繁體中文, zh-TW).",
      "- exampleTranslation must be in Traditional Chinese (繁體中文, zh-TW).",
      "- example must be an English sentence using the given word naturally.",
      "If unsure, set nulls. Return ONLY JSON.",
      `word: ${JSON.stringify(t)}`
    ].join("\n");

    const res = await model.generateContent(prompt);
    const raw = res.response.text().trim();

    // Best-effort JSON parse; if Gemini returns extra text, attempt to extract JSON block.
    const jsonText = this.extractJson(raw);
    const parsed = JSON.parse(jsonText) as TranslationResult;

    if (!parsed.definition || typeof parsed.definition !== "string") {
      throw new Error("Gemini response missing definition");
    }

    return {
      definition: parsed.definition,
      partOfSpeech: parsed.partOfSpeech ?? null,
      phonetic: parsed.phonetic ?? null,
      example: parsed.example ?? null,
      exampleTranslation: parsed.exampleTranslation ?? null
    };
  }

  private extractJson(raw: string): string {
    if (raw.startsWith("{") && raw.endsWith("}")) return raw;
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) return raw.slice(first, last + 1);
    return raw;
  }
}

