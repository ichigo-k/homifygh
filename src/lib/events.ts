import type { Prisma, PrismaClient } from "@prisma/client"

type Db = PrismaClient | Prisma.TransactionClient

export async function notify(db: Db, input: { userId: string; type: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM"; title: string; message: string; href?: string }) {
  return db.notification.create({ data: { ...input, href: input.href ?? null } })
}

export async function audit(db: Db, input: { actorId?: string; action: string; entityType: string; entityId: string; metadata?: Prisma.InputJsonValue }) {
  return db.auditLog.create({ data: { actorId: input.actorId ?? null, action: input.action, entityType: input.entityType, entityId: input.entityId, metadata: input.metadata } })
}
