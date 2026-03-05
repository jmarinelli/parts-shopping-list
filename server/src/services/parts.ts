import { eq, count } from 'drizzle-orm';
import { db } from '../db';
import { parts } from '../db/schema/parts';
import { options } from '../db/schema/options';

export async function listPartsByProjectId(projectId: string) {
  const rows = await db
    .select({
      id: parts.id,
      projectId: parts.projectId,
      name: parts.name,
      status: parts.status,
      isOptional: parts.isOptional,
      sortOrder: parts.sortOrder,
      selectedOptionId: parts.selectedOptionId,
      createdAt: parts.createdAt,
      updatedAt: parts.updatedAt,
      selectedOptionName: options.name,
      selectedOptionPrice: options.price,
      selectedOptionCurrency: options.currency,
    })
    .from(parts)
    .leftJoin(options, eq(parts.selectedOptionId, options.id))
    .where(eq(parts.projectId, projectId))
    .orderBy(parts.sortOrder);

  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    status: row.status,
    isOptional: row.isOptional,
    sortOrder: row.sortOrder,
    selectedOptionId: row.selectedOptionId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    selectedOption: row.selectedOptionId
      ? {
          id: row.selectedOptionId,
          name: row.selectedOptionName,
          price: row.selectedOptionPrice,
          currency: row.selectedOptionCurrency,
        }
      : null,
  }));
}

export async function getPartById(id: string) {
  const results = await db
    .select()
    .from(parts)
    .where(eq(parts.id, id));
  return results[0] ?? null;
}

export async function getPartWithOptions(id: string) {
  const part = await getPartById(id);
  if (!part) return null;

  const partOptions = await db
    .select()
    .from(options)
    .where(eq(options.partId, id));

  return { ...part, options: partOptions };
}

export async function createPart(
  projectId: string,
  data: { name: string; status?: string; isOptional?: boolean },
) {
  const [maxOrderResult] = await db
    .select({ value: count() })
    .from(parts)
    .where(eq(parts.projectId, projectId));

  const sortOrder = maxOrderResult.value;

  const results = await db
    .insert(parts)
    .values({
      projectId,
      name: data.name,
      status: data.status ?? 'pending',
      isOptional: data.isOptional ?? false,
      sortOrder,
    })
    .returning();
  return results[0];
}

export async function updatePart(
  id: string,
  data: { name?: string; status?: string; isOptional?: boolean },
) {
  const results = await db
    .update(parts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(parts.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deletePart(id: string) {
  const results = await db
    .delete(parts)
    .where(eq(parts.id, id))
    .returning({ id: parts.id });
  return results[0] ?? null;
}

export async function reorderParts(projectId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(parts)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(parts.id, orderedIds[i]));
  }
  return listPartsByProjectId(projectId);
}

export async function selectOption(partId: string, optionId: string) {
  const results = await db
    .update(parts)
    .set({ selectedOptionId: optionId, updatedAt: new Date() })
    .where(eq(parts.id, partId))
    .returning();
  return results[0] ?? null;
}
