import { eq, count } from 'drizzle-orm';
import { db } from '../db';
import { partGroups } from '../db/schema/part-groups';
import { options } from '../db/schema/options';
import { parts } from '../db/schema/parts';

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  ordered: 1,
  owned: 2,
};

function minStatus(statuses: string[]): 'pending' | 'ordered' | 'owned' {
  let min = Infinity;
  let minStatus = 'owned';
  for (const s of statuses) {
    const order = STATUS_ORDER[s] ?? 0;
    if (order < min) {
      min = order;
      minStatus = s;
    }
  }
  return minStatus as 'pending' | 'ordered' | 'owned';
}

export async function listPartGroupsByProjectId(projectId: string) {
  const groups = await db
    .select()
    .from(partGroups)
    .where(eq(partGroups.projectId, projectId))
    .orderBy(partGroups.sortOrder);

  const result = [];
  for (const group of groups) {
    let computedStatus: 'pending' | 'ordered' | 'owned' | null = null;
    let selectedOption: {
      id: string;
      name: string;
      computedPrice: number | null;
      currencies: string[];
    } | null = null;

    if (group.selectedOptionId) {
      const [opt] = await db
        .select()
        .from(options)
        .where(eq(options.id, group.selectedOptionId));

      if (opt) {
        const optParts = await db
          .select()
          .from(parts)
          .where(eq(parts.optionId, opt.id));

        if (optParts.length > 0) {
          computedStatus = minStatus(optParts.map((p) => p.status));

          const currencies = [...new Set(optParts.map((p) => p.currency))];
          const computedPrice =
            currencies.length === 1
              ? optParts.reduce((sum, p) => sum + Number(p.price), 0)
              : null;

          selectedOption = {
            id: opt.id,
            name: opt.name,
            computedPrice,
            currencies,
          };
        } else {
          selectedOption = {
            id: opt.id,
            name: opt.name,
            computedPrice: null,
            currencies: [],
          };
        }
      }
    }

    result.push({
      ...group,
      computedStatus,
      selectedOption,
    });
  }

  return result;
}

export async function getPartGroupById(id: string) {
  const results = await db
    .select()
    .from(partGroups)
    .where(eq(partGroups.id, id));
  return results[0] ?? null;
}

export async function getPartGroupWithOptions(id: string) {
  const group = await getPartGroupById(id);
  if (!group) return null;

  const groupOptions = await db
    .select()
    .from(options)
    .where(eq(options.partGroupId, id))
    .orderBy(options.createdAt);

  const optionsWithParts = [];
  for (const opt of groupOptions) {
    const optParts = await db
      .select()
      .from(parts)
      .where(eq(parts.optionId, opt.id));
    optionsWithParts.push({ ...opt, parts: optParts });
  }

  return { ...group, options: optionsWithParts };
}

export async function createPartGroup(
  projectId: string,
  data: { name: string; isOptional?: boolean },
) {
  const [maxOrderResult] = await db
    .select({ value: count() })
    .from(partGroups)
    .where(eq(partGroups.projectId, projectId));

  const sortOrder = maxOrderResult.value;

  const results = await db
    .insert(partGroups)
    .values({
      projectId,
      name: data.name,
      isOptional: data.isOptional ?? false,
      sortOrder,
    })
    .returning();
  return results[0];
}

export async function updatePartGroup(
  id: string,
  data: { name?: string; isOptional?: boolean },
) {
  const results = await db
    .update(partGroups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(partGroups.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deletePartGroup(id: string) {
  const results = await db
    .delete(partGroups)
    .where(eq(partGroups.id, id))
    .returning({ id: partGroups.id });
  return results[0] ?? null;
}

export async function reorderPartGroups(
  projectId: string,
  orderedIds: string[],
) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(partGroups)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(partGroups.id, orderedIds[i]));
  }
  return listPartGroupsByProjectId(projectId);
}

export async function selectOption(partGroupId: string, optionId: string) {
  const results = await db
    .update(partGroups)
    .set({ selectedOptionId: optionId, updatedAt: new Date() })
    .where(eq(partGroups.id, partGroupId))
    .returning();
  return results[0] ?? null;
}
