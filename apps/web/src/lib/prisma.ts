import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure sqlite path resolves correctly on Windows regardless of CWD
const dbPath = path.resolve(process.cwd(), process.cwd().endsWith("web") ? "../../prisma/dev.db" : "./prisma/dev.db").replace(/\\/g, "/");
const datasourceUrl = process.env.DATABASE_URL || `file:${dbPath}`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

