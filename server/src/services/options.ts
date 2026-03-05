import { eq, count } from 'drizzle-orm';
import { db } from '../db';
import { options } from '../db/schema/options';
import { parts } from '../db/schema/parts';

export async function listOptionsByPartId(partId: string) {
  return db
    .select()
    .from(options)
    .where(eq(options.partId, partId))
    .orderBy(options.createdAt);
}

export async function getOptionById(id: string) {
  const results = await db
    .select()
    .from(options)
    .where(eq(options.id, id));
  return results[0] ?? null;
}

export async function createOption(
  partId: string,
  data: {
    name: string;
    price: string;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  },
) {
  const results = await db
    .insert(options)
    .values({
      partId,
      name: data.name,
      price: data.price,
      currency: data.currency,
      source: data.source ?? null,
      link: data.link ?? null,
      comment: data.comment ?? null,
    })
    .returning();

  const option = results[0];

  // Auto-selection: if this is the only option, select it
  const [countResult] = await db
    .select({ value: count() })
    .from(options)
    .where(eq(options.partId, partId));

  if (countResult.value === 1) {
    await db
      .update(parts)
      .set({ selectedOptionId: option.id, updatedAt: new Date() })
      .where(eq(parts.id, partId));
  }

  return option;
}

export async function updateOption(
  id: string,
  data: {
    name?: string;
    price?: string;
    currency?: string;
    source?: string | null;
    link?: string | null;
    comment?: string | null;
  },
) {
  const results = await db
    .update(options)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(options.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteOption(id: string) {
  const option = await getOptionById(id);
  if (!option) return null;

  const partId = option.partId;

  await db.delete(options).where(eq(options.id, id));

  // Get the part to check if the deleted option was selected
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId));

  if (part) {
    // If the deleted option was the selected one, clear selection
    if (part.selectedOptionId === id) {
      await db
        .update(parts)
        .set({ selectedOptionId: null, updatedAt: new Date() })
        .where(eq(parts.id, partId));
    }

    // Auto-selection: if exactly one option remains, select it
    const remaining = await db
      .select()
      .from(options)
      .where(eq(options.partId, partId));

    if (remaining.length === 1) {
      await db
        .update(parts)
        .set({ selectedOptionId: remaining[0].id, updatedAt: new Date() })
        .where(eq(parts.id, partId));
    }
  }

  return { id };
}
