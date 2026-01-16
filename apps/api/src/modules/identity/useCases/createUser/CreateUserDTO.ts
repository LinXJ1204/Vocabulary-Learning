import type {
  ApiResponse,
  CreateUserRequestDTO,
  CreateUserResponseDTO
} from "@evb/shared-types";

export type CreateUserRequest = CreateUserRequestDTO;
export type CreateUserResponse = ApiResponse<CreateUserResponseDTO>;

