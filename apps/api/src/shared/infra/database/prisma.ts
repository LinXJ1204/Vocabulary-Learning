import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      [
        "DATABASE_URL is missing.",
        "Create apps/api/.env (gitignored) and set DATABASE_URL, e.g.:",
        'DATABASE_URL="postgresql://evb:evb_password@localhost:5433/evb_dev?schema=public"',
        "",
        "Then restart the API."
      ].join("\n")
    );
  }
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

