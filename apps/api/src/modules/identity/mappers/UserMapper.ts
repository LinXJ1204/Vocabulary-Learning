import type { Prisma, User as PrismaUser } from "@prisma/client";
import { User } from "../domain/User";
import { Result } from "../../../shared/core/Result";

export class UserMapper {
  public static toDomain(raw: PrismaUser): Result<User> {
    return User.create(
      {
        email: raw.email,
        googleId: raw.googleId,
        role: raw.role as any
      },
      raw.id
    );
  }

  public static toPersistenceCreate(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      googleId: user.googleId,
      role: user.role
    };
  }
}

