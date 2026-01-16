import type { ApiResponse, WordDTO } from "@evb/shared-types";

export type ListWordsRequest = { userId: string };
export type ListWordsResponse = ApiResponse<WordDTO[]>;

