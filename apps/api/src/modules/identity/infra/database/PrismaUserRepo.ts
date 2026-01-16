import type { PrismaClient } from "@prisma/client";
import { UserMapper } from "../../mappers/UserMapper";
import type { IUserRepository } from "../../repos/IUserRepository";
import type { User } from "../../domain/User";

export class PrismaUserRepo implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    const mapped = UserMapper.toDomain(raw);
    if (mapped.isFailure) throw new Error(String(mapped.error));
    return mapped.getValue();
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    const mapped = UserMapper.toDomain(raw);
    if (mapped.isFailure) throw new Error(String(mapped.error));
    return mapped.getValue();
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistenceCreate(user);
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: {
        email: data.email,
        googleId: data.googleId,
        role: data.role
      }
    });
  }
}

