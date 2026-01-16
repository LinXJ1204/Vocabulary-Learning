export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// Identity DTOs
export type CreateUserRequestDTO = {
  email: string;
};

export type UserDTO = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export type CreateUserResponseDTO = UserDTO;

export type MeResponseDTO = UserDTO;

// Vocabulary DTOs
export type AddWordRequestDTO = {
  text: string;
};

export type WordInfoDTO = {
  definition: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
};

export type WordExampleDTO = {
  id: string;
  example: string;
  translation: string;
};

export type WordStatsDTO = {
  reviewCount: number;
  nextReviewDate: string | null; // ISO
};

export type WordDTO = {
  id: string;
  userId: string;
  text: string;
  info: WordInfoDTO;
  examples: WordExampleDTO[];
  stats: WordStatsDTO;
  createdAt: string; // ISO
};

export type AddWordResponseDTO = WordDTO;

