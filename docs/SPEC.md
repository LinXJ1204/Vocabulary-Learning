這是一份針對 **AI English Vocabulary Builder** 專案的完整技術架構文件。這份文件是基於 **Monorepo**、**Express**、**Next.js** 以及 **DDD (Domain-Driven Design)** 架構所撰寫。

---

# AI English Vocabulary Builder - 技術架構文件 (TDD)

## 1. 專案概觀 (Project Overview)

本專案為支援 PWA 的英文單字學習平台。核心價值在於整合 **Google Gemini AI** 自動進行單字解析（翻譯、詞性、例句），並透過 **DDD 架構** 確保業務邏輯的獨立性與可測試性，同時支援 Google OAuth 多人登入。

---

## 2. 基礎建設與技術選型 (Infrastructure & Tech Stack)

### 2.1 Monorepo 架構 (Turborepo)

採用 Monorepo 管理前後端與共享套件，確保型別安全與開發效率。

```text
root/
├── apps/
│   ├── web/           # Frontend: Next.js 14+ (App Router), Tailwind, PWA
│   └── api/           # Backend: Express, TypeScript, Modular Monolith
├── packages/
│   ├── ts-config/     # Shared TypeScript configurations
│   ├── eslint-config/ # Shared Linter rules
│   └── shared-types/  # 前後端共用的 DTOs / API Response Types
├── package.json
└── turbo.json

```

### 2.2 關鍵技術

| 領域 | 技術/工具 | 用途 |
| --- | --- | --- |
| **Language** | TypeScript | 全端強型別語言 |
| **Runtime** | Node.js (v20+) | 執行環境 |
| **Frontend** | Next.js, Zustand | SSR, PWA, 狀態管理 |
| **Backend** | Express.js | RESTful API 服務 |
| **Database** | PostgreSQL / SQLite | 關聯式資料庫 (初期開發可用 SQLite) |
| **ORM** | Prisma | 資料庫存取與遷移 (作為 Infrastructure 層) |
| **AI** | Gemini 2.5 Flash | 自動化翻譯與解析 |
| **Auth** | JWT + Google OAuth | 無狀態身份驗證 |

---

## 3. 領域驅動設計 (Domain Modeling)

我們將系統劃分為兩個主要的 **Bounded Context (限界上下文)**。

### 3.1 Context Map

* **Identity Context**: 負責使用者認證、權限管理。
* **Vocabulary Context**: 負責單字學習的核心業務（新增、查詢、AI 解析）。

### 3.2 實體定義 (Entities & Aggregates)

#### A. Identity Context

* **Aggregate Root**: `User`
* `id`: UUID
* `email`: string (Unique)
* `googleId`: string
* `role`: 'user' | 'admin'



#### B. Vocabulary Context

* **Aggregate Root**: `Word`
* `id`: UUID
* `userId`: UUID (關聯到 Identity Context 的參考)
* `text`: string (單字原型)
* `info`: ValueObject (包含 definition, partOfSpeech, phonetic)
* `examples`: Entity List (包含例句與翻譯)
* `stats`: ValueObject (reviewCount, nextReviewDate)
* **Invariants (業務規則)**:
* 單字不得為空。
* 同一個 User 下，單字 `text` 不能重複 (由 Domain Service 或 Repo 檢查)。





---

## 4. Shared Kernel (核心共用程式碼)

在 DDD 中，我們需要建立一組 Base Classes 來規範 Entity 與 UseCase 的寫法。請將這些程式碼放在 `apps/api/src/shared/core`。

### 4.1 Entity (實體基底類別)

所有 Domain Object 繼承此類別，確保擁有唯一 ID 並區分 Entity 與 Value Object。

```typescript
// apps/api/src/shared/core/Entity.ts
import { v4 as uuidv4 } from 'uuid';

export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id ? id : uuidv4();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }
  
  // 比較兩個實體是否相同 (基於 ID)
  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!(object instanceof Entity)) {
      return false;
    }
    return this._id === object._id;
  }
}

```

### 4.2 Result (結果封裝)

使用 Result Pattern 取代 `try-catch` 拋出錯誤，讓業務邏輯更清晰 (Railway Oriented Programming)。

```typescript
// apps/api/src/shared/core/Result.ts
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: string | object;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string | object, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'error' instead.");
    }
    return this._value as T;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string | object): Result<U> {
    return new Result<U>(false, error);
  }
}

```

### 4.3 UseCase (應用層介面)

規範所有業務邏輯的進入點。

```typescript
// apps/api/src/shared/core/UseCase.ts
export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}

```

---

## 5. 後端整體架構 (Backend Architecture)

Express 後端採用 **Modular Monolith**，每個模組內部遵循 **Clean Architecture** 分層。

### 5.1 資料夾結構 (`apps/api/src`)

```text
src/
├── app.ts                  # Express App Entry
├── shared/                 # Kernel (Entity, Result, Guard...)
│
└── modules/
    └── vocabulary/         # [Vocabulary Bounded Context]
        ├── domain/         # [Inner Layer] 純業務邏輯
        │   ├── Word.ts     # Aggregate Root
        │   └── WordValueObjects.ts
        │
        ├── repos/          # [Port] Repository 介面
        │   └── IWordRepository.ts
        │
        ├── services/       # [Port] External Service 介面
        │   └── ITranslationService.ts
        │
        ├── useCases/       # [Application Layer] 流程編排
        │   └── addWord/
        │       ├── AddWordUseCase.ts
        │       ├── AddWordDTO.ts
        │       └── AddWordController.ts
        │
        └── infra/          # [Outer Layer] 實作細節
            ├── http/       # Express Routes
            ├── database/   # Prisma Implementation (WordRepo)
            └── ai/         # Gemini Implementation (TranslationService)

```

### 5.2 依賴注入 (Dependency Injection)

為了讓 UseCase 不依賴具體實作 (如 Gemini 或 DB)，我們需要在 App 啟動時手動注入依賴。

```typescript
// apps/api/src/app.ts (簡易示意)

// 1. 初始化 Infra
const prisma = new PrismaClient();
const wordRepo = new PrismaWordRepo(prisma);
const translationService = new GeminiTranslationService(process.env.GEMINI_API_KEY);

// 2. 初始化 UseCase
const addWordUseCase = new AddWordUseCase(wordRepo, translationService);

// 3. 初始化 Controller
const addWordController = new AddWordController(addWordUseCase);

// 4. 設定 Route
const vocabularyRouter = express.Router();
vocabularyRouter.post('/words', (req, res) => addWordController.execute(req, res));

```

---

## 6. 資料庫與 AI 整合 (Infra Layer Detail)

### 6.1 Prisma Schema (`schema.prisma`)

這只是底層儲存結構，**不等於** Domain Entity。我們需要 Mapper 來轉換。

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  googleId  String   @unique
  words     Word[]
}

model Word {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  text          String
  definition    String
  partOfSpeech  String?
  phonetic      String?
  example       String?   @db.Text
  exampleTrans  String?   @db.Text
  createdAt     DateTime  @default(now())

  @@unique([userId, text]) // 複合索引
}

```

### 6.2 Data Mapper (Mapper Pattern)

**這是 DDD 最關鍵的一步**：將 DB 資料轉為 Domain Entity。

```typescript
// apps/api/src/modules/vocabulary/mappers/WordMapper.ts

export class WordMapper {
  // Domain -> Persistence (存檔用)
  static toPersistence(word: Word): any {
    return {
      id: word.id,
      text: word.text,
      // ...拆解 value objects
    }
  }

  // Persistence -> Domain (讀取用)
  static toDomain(raw: any): Word {
    return Word.create({
      text: raw.text,
      // ...重組 props
    }, raw.id); // 傳入現有 ID
  }
}

```

---

## 7. DDD 開發注意事項與準則 (Guidelines)

為了避免將 DDD 寫成 CRUD，請遵守以下原則：

1. **依賴反轉 (DIP)**:
* `Domain` 層**絕對不能** import `infra` 層的東西 (例如 PrismaClient, Gemini SDK)。
* 所有的依賴都必須指向 `Interface` (定義在 domain 或 useCases 層)。


2. **豐富的領域模型 (Rich Domain Model)**:
* 避免 "Anemic Domain Model" (貧血模型 - 只有 getter/setter 的 class)。
* 業務邏輯應寫在 Entity 內。例如：`word.updateDefinition(...)` 而不是在 Service 裡直接改屬性。


3. **DTO 與 Entity 分離**:
* Controller 接收的是 DTO (Data Transfer Object, 純 JSON)。
* UseCase 處理的是 Entity。
* Repository 回傳的是 Entity (經過 Mapper 轉換)。
* **不要把 Entity 直接回傳給前端**，應透過 `WordMap.toDTO(word)` 轉成 JSON。


4. **Always Valid Domain State**:
* Entity 的 `create` 方法 (Factory) 必須確保建立出來的物件是合法的 (例如：單字不能為空)。如果不合法，直接拋出錯誤或回傳 `Result.fail`。


5. **測試策略**:
* **Unit Test**: 針對 Domain Entity 和 UseCases 寫測試。因為依賴介面，你可以輕鬆 Mock `IWordRepository` 和 `ITranslationService`。
* **Integration Test**: 針對 Repositories (測試 Prisma) 和 API Routes 寫測試。



---

## 8. 補充：環境變數設定 (.env)

```ini
# Database
DATABASE_URL="file:./dev.db" # 或 postgresql://...

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="super-secret-key"

# AI Service
GEMINI_API_KEY="your-gemini-api-key"

```

這份文件提供了從架構理論到程式碼實作的完整藍圖。建議先從 **Shared Kernel** 開始搭建，接著實作 **Vocabulary Context** 的核心邏輯。