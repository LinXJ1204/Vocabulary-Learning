import type { ApiResponse } from "@evb/shared-types";

export type DeleteWordRequest = { userId: string; wordId: string };
export type DeleteWordResponse = ApiResponse<{ id: string }>;

