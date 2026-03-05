import { eq } from 'drizzle-orm';
import { db } from '../db';
import { parts } from '../db/schema/parts';

const VALID_STATUSES = ['pending', 'ordered', 'owned'];

export async function listPartsByOptionId(optionId: string) {
  return db
    .select()
    .from(parts)
    .where(eq(parts.optionId, optionId))
    .orderBy(parts.createdAt);
}

export async function getPartById(id: string) {
  const results = await db.select().from(parts).where(eq(parts.id, id));
  return results[0] ?? null;
}

export async function createPart(
  optionId: string,
  data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  },
) {
  const [part] = await db
    .insert(parts)
    .values({
      optionId,
      name: data.name,
      price: String(data.price),
      currency: data.currency.toUpperCase(),
      source: data.source ?? null,
      link: data.link ?? null,
      comment: data.comment ?? null,
    })
    .returning();

  return part;
}

export async function updatePart(
  id: string,
  data: {
    name?: string;
    price?: number;
    currency?: string;
    source?: string;
    link?: string;
    comment?: string;
    status?: string;
  },
) {
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    return { validationError: 'Invalid status' };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.currency !== undefined)
    updateData.currency = data.currency.toUpperCase();
  if (data.source !== undefined) updateData.source = data.source;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.comment !== undefined) updateData.comment = data.comment;
  if (data.status !== undefined) updateData.status = data.status;

  const [updated] = await db
    .update(parts)
    .set(updateData)
    .where(eq(parts.id, id))
    .returning();

  return updated ?? null;
}

export async function deletePart(id: string) {
  const results = await db
    .delete(parts)
    .where(eq(parts.id, id))
    .returning({ id: parts.id });
  return results[0] ?? null;
}
