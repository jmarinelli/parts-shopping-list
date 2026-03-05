import { eq } from 'drizzle-orm';
import { db } from '../db';
import { partGroups } from '../db/schema/part-groups';
import { options } from '../db/schema/options';
import { parts } from '../db/schema/parts';
import { exchangeRates } from '../db/schema/exchange-rates';

interface TotalsResult {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
  availableCurrencies: string[];
}

interface TotalsError {
  error: string;
  missingPair: { from: string; to: string };
  availableCurrencies: string[];
}

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  ordered: 1,
  owned: 2,
};

function minStatus(statuses: string[]): 'pending' | 'ordered' | 'owned' {
  let min = Infinity;
  let minS = 'owned';
  for (const s of statuses) {
    const order = STATUS_ORDER[s] ?? 0;
    if (order < min) {
      min = order;
      minS = s;
    }
  }
  return minS as 'pending' | 'ordered' | 'owned';
}

export async function getAvailableCurrencies(
  projectId: string,
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ currency: parts.currency })
    .from(parts)
    .innerJoin(options, eq(parts.optionId, options.id))
    .innerJoin(partGroups, eq(options.partGroupId, partGroups.id))
    .where(eq(partGroups.projectId, projectId));

  return rows.map((r) => r.currency).sort();
}

function findDirectRate(
  rates: { fromCurrency: string; toCurrency: string; rate: string }[],
  from: string,
  to: string,
): number | null {
  if (from === to) return 1;

  const direct = rates.find(
    (r) => r.fromCurrency === from && r.toCurrency === to,
  );
  if (direct) return parseFloat(direct.rate);

  const inverse = rates.find(
    (r) => r.fromCurrency === to && r.toCurrency === from,
  );
  if (inverse) return 1 / parseFloat(inverse.rate);

  return null;
}

function resolveRate(
  rates: { fromCurrency: string; toCurrency: string; rate: string }[],
  from: string,
  to: string,
): number | { missingPair: { from: string; to: string } } {
  const direct = findDirectRate(rates, from, to);
  if (direct !== null) return direct;

  if (from !== 'USD' && to !== 'USD') {
    const fromToUsd = findDirectRate(rates, from, 'USD');
    const usdToTarget = findDirectRate(rates, 'USD', to);

    if (fromToUsd !== null && usdToTarget !== null) {
      return fromToUsd * usdToTarget;
    }

    if (fromToUsd === null) {
      return { missingPair: { from: 'USD', to: from } };
    }
    return { missingPair: { from: 'USD', to } };
  }

  return { missingPair: { from: 'USD', to: from === 'USD' ? to : from } };
}

export async function calculateTotals(
  projectId: string,
  currency: string,
  includeOptionals: boolean,
): Promise<TotalsResult | TotalsError> {
  const availableCurrencies = await getAvailableCurrencies(projectId);

  if (availableCurrencies.length === 0) {
    return {
      total: 0,
      spent: 0,
      remaining: 0,
      currency,
      availableCurrencies: [],
    };
  }

  const groups = await db
    .select()
    .from(partGroups)
    .where(eq(partGroups.projectId, projectId));

  const rates = await db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.projectId, projectId));

  let spent = 0;
  let remaining = 0;

  for (const group of groups) {
    if (!group.selectedOptionId) continue;
    if (!includeOptionals && group.isOptional) continue;

    const optParts = await db
      .select()
      .from(parts)
      .where(eq(parts.optionId, group.selectedOptionId));

    if (optParts.length === 0) continue;

    const groupStatus = minStatus(optParts.map((p) => p.status));

    let groupTotal = 0;
    for (const part of optParts) {
      const rate = resolveRate(rates, part.currency, currency);
      if (typeof rate !== 'number') {
        return {
          error: `Missing exchange rate: ${rate.missingPair.from} → ${rate.missingPair.to}`,
          missingPair: rate.missingPair,
          availableCurrencies,
        };
      }
      groupTotal += parseFloat(part.price) * rate;
    }

    if (groupStatus === 'pending') {
      remaining += groupTotal;
    } else {
      spent += groupTotal;
    }
  }

  return {
    total: Math.round((spent + remaining) * 100) / 100,
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    currency,
    availableCurrencies,
  };
}
