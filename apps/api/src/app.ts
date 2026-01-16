import dotenv from "dotenv";
import path from "node:path";
import express from "express";
import { getPrismaClient } from "./shared/infra/database/prisma";
import { PrismaWordRepo } from "./modules/vocabulary/infra/database/PrismaWordRepo";
import { PrismaUserRepo } from "./modules/identity/infra/database/PrismaUserRepo";
import { StubTranslationService } from "./modules/vocabulary/infra/ai/StubTranslationService";
import { GeminiTranslationService } from "./modules/vocabulary/infra/ai/GeminiTranslationService";
import { CreateUserUseCase } from "./modules/identity/useCases/createUser/CreateUserUseCase";
import { buildIdentityRouter } from "./modules/identity/infra/http/identityRouter";
import { AddWordUseCase } from "./modules/vocabulary/useCases/addWord/AddWordUseCase";
import { ListWordsUseCase } from "./modules/vocabulary/useCases/listWords/ListWordsUseCase";
import { DeleteWordUseCase } from "./modules/vocabulary/useCases/deleteWord/DeleteWordUseCase";
import { buildVocabularyRouter } from "./modules/vocabulary/infra/http/vocabularyRouter";

// Load env deterministically (Turborepo may run this with cwd=apps/api).
// - repo root:   <repo>/.env
// - api app:     <repo>/apps/api/.env
dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env"), override: true });

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// DI composition root
const prisma = getPrismaClient();
const wordRepo = new PrismaWordRepo(prisma);
const userRepo = new PrismaUserRepo(prisma);
const translationProvider = (process.env.TRANSLATION_PROVIDER ?? "stub").toLowerCase();
const translationService =
  translationProvider === "gemini"
    ? new GeminiTranslationService(
        process.env.GEMINI_API_KEY ?? "",
        process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
      )
    : new StubTranslationService();
const addWordUseCase = new AddWordUseCase(wordRepo, translationService, userRepo);
const listWordsUseCase = new ListWordsUseCase(wordRepo);
const deleteWordUseCase = new DeleteWordUseCase(wordRepo);
const createUserUseCase = new CreateUserUseCase(userRepo);

app.use(
  "/vocabulary",
  buildVocabularyRouter({ addWordUseCase, listWordsUseCase, deleteWordUseCase })
);
app.use("/identity", buildIdentityRouter({ createUserUseCase }));

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});

