import type { AddWordResponseDTO, ApiResponse } from "@evb/shared-types";

export type AddWordRequest = { userId: string; text: string };
export type AddWordResponse = ApiResponse<AddWordResponseDTO>;

