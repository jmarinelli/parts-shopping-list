import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { exchangeRates } from '../db/schema/exchange-rates';

export async function listByProjectId(projectId: string) {
  return db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.projectId, projectId))
    .orderBy(exchangeRates.fromCurrency, exchangeRates.toCurrency);
}

export async function upsertRates(
  projectId: string,
  rates: { fromCurrency: string; toCurrency: string; rate: string }[],
) {
  const results = [];

  for (const r of rates) {
    const existing = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.projectId, projectId),
          eq(exchangeRates.fromCurrency, r.fromCurrency),
          eq(exchangeRates.toCurrency, r.toCurrency),
        ),
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(exchangeRates)
        .set({ rate: r.rate, updatedAt: new Date() })
        .where(eq(exchangeRates.id, existing[0].id))
        .returning();
      results.push(updated);
    } else {
      const [created] = await db
        .insert(exchangeRates)
        .values({
          projectId,
          fromCurrency: r.fromCurrency,
          toCurrency: r.toCurrency,
          rate: r.rate,
        })
        .returning();
      results.push(created);
    }
  }

  return results;
}
