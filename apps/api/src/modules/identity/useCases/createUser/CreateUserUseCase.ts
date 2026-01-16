import type { CreateUserRequest, CreateUserResponse } from "./CreateUserDTO";
import type { IUserRepository } from "../../repos/IUserRepository";
import { User } from "../../domain/User";

export class CreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Minimal flow: create-or-get by email.
   * (No OAuth/JWT yet.)
   */
  public async execute(req: CreateUserRequest): Promise<CreateUserResponse> {
    const email = req.email?.trim();
    if (!email) return { ok: false, error: { message: "email is required" } };

    const existing = await this.userRepo.findByEmail(email.toLowerCase());
    if (existing) {
      return {
        ok: true,
        data: { id: existing.id, email: existing.email, role: existing.role }
      };
    }

    const userOrError = User.create({ email, role: "user" });
    if (userOrError.isFailure) {
      return { ok: false, error: { message: String(userOrError.error ?? "Invalid user") } };
    }

    const user = userOrError.getValue();
    await this.userRepo.save(user);

    return { ok: true, data: { id: user.id, email: user.email, role: user.role } };
  }
}

