// lib/prisma.js
import { PrismaClient } from "@prisma/client";
const g = globalThis;
export const prisma = g.prisma ?? new PrismaClient({ log: ["error","warn"] });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
