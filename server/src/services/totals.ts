import { eq } from 'drizzle-orm';
import { db } from '../db';
import { parts } from '../db/schema/parts';
import { options } from '../db/schema/options';
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

export async function getAvailableCurrencies(
  projectId: string,
): Promise<string[]> {
  const allOptions = await db
    .select({ currency: options.currency })
    .from(options)
    .innerJoin(parts, eq(options.partId, parts.id))
    .where(eq(parts.projectId, projectId));

  const currencies = [...new Set(allOptions.map((o) => o.currency))].sort();
  return currencies;
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
  // Try direct/inverse lookup
  const direct = findDirectRate(rates, from, to);
  if (direct !== null) return direct;

  // Try converting through USD as intermediary (from → USD → to)
  if (from !== 'USD' && to !== 'USD') {
    const fromToUsd = findDirectRate(rates, from, 'USD');
    const usdToTarget = findDirectRate(rates, 'USD', to);

    if (fromToUsd !== null && usdToTarget !== null) {
      return fromToUsd * usdToTarget;
    }

    // Report which USD pair is missing
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

  const projectParts = await db
    .select({
      status: parts.status,
      isOptional: parts.isOptional,
      selectedOptionId: parts.selectedOptionId,
      optionPrice: options.price,
      optionCurrency: options.currency,
    })
    .from(parts)
    .leftJoin(options, eq(parts.selectedOptionId, options.id))
    .where(eq(parts.projectId, projectId));

  const rates = await db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.projectId, projectId));

  let spent = 0;
  let remaining = 0;

  for (const part of projectParts) {
    if (!part.selectedOptionId || !part.optionPrice || !part.optionCurrency) {
      continue;
    }

    if (!includeOptionals && part.isOptional) {
      continue;
    }

    const rate = resolveRate(rates, part.optionCurrency, currency);
    if (typeof rate !== 'number') {
      return {
        error: `Missing exchange rate: ${rate.missingPair.from} → ${rate.missingPair.to}`,
        missingPair: rate.missingPair,
        availableCurrencies,
      };
    }

    const converted = parseFloat(part.optionPrice) * rate;

    if (part.status === 'pending') {
      remaining += converted;
    } else {
      spent += converted;
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
