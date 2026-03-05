import { eq, count } from 'drizzle-orm';
import { db } from '../db';
import { options } from '../db/schema/options';
import { parts } from '../db/schema/parts';
import { partGroups } from '../db/schema/part-groups';

async function getOptionWithParts(optionId: string) {
  const [option] = await db
    .select()
    .from(options)
    .where(eq(options.id, optionId));
  if (!option) return null;

  const optParts = await db
    .select()
    .from(parts)
    .where(eq(parts.optionId, optionId));

  return { ...option, parts: optParts };
}

export async function listOptionsByPartGroupId(partGroupId: string) {
  const allOptions = await db
    .select()
    .from(options)
    .where(eq(options.partGroupId, partGroupId))
    .orderBy(options.createdAt);

  const result = [];
  for (const opt of allOptions) {
    const optParts = await db
      .select()
      .from(parts)
      .where(eq(parts.optionId, opt.id));
    result.push({ ...opt, parts: optParts });
  }
  return result;
}

export async function getOptionById(id: string) {
  return getOptionWithParts(id);
}

export async function createOption(
  partGroupId: string,
  data: {
    name: string;
    firstPart: {
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    };
  },
) {
  return db.transaction(async (tx) => {
    // 1. Insert option
    const [option] = await tx
      .insert(options)
      .values({
        partGroupId,
        name: data.name,
      })
      .returning();

    // 2. Insert first part
    const [part] = await tx
      .insert(parts)
      .values({
        optionId: option.id,
        name: data.firstPart.name,
        price: String(data.firstPart.price),
        currency: data.firstPart.currency,
        source: data.firstPart.source ?? null,
        link: data.firstPart.link ?? null,
        comment: data.firstPart.comment ?? null,
      })
      .returning();

    // 3. Auto-selection: if this is the only option, select it
    const [countResult] = await tx
      .select({ value: count() })
      .from(options)
      .where(eq(options.partGroupId, partGroupId));

    if (countResult.value === 1) {
      await tx
        .update(partGroups)
        .set({ selectedOptionId: option.id, updatedAt: new Date() })
        .where(eq(partGroups.id, partGroupId));
    }

    return { ...option, parts: [part] };
  });
}

export async function updateOption(id: string, data: { name?: string }) {
  const [updated] = await db
    .update(options)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(options.id, id))
    .returning();

  if (!updated) return null;

  const optParts = await db
    .select()
    .from(parts)
    .where(eq(parts.optionId, id));

  return { ...updated, parts: optParts };
}

export async function deleteOption(id: string) {
  const [option] = await db
    .select()
    .from(options)
    .where(eq(options.id, id));
  if (!option) return null;

  const partGroupId = option.partGroupId;

  await db.delete(options).where(eq(options.id, id));

  // Get the part group to check if the deleted option was selected
  const [group] = await db
    .select()
    .from(partGroups)
    .where(eq(partGroups.id, partGroupId));

  if (group) {
    // If the deleted option was the selected one, clear selection
    if (group.selectedOptionId === id) {
      await db
        .update(partGroups)
        .set({ selectedOptionId: null, updatedAt: new Date() })
        .where(eq(partGroups.id, partGroupId));
    }

    // Auto-selection: if exactly one option remains, select it
    const remaining = await db
      .select()
      .from(options)
      .where(eq(options.partGroupId, partGroupId));

    if (remaining.length === 1) {
      await db
        .update(partGroups)
        .set({ selectedOptionId: remaining[0].id, updatedAt: new Date() })
        .where(eq(partGroups.id, partGroupId));
    }
  }

  return { id };
}
