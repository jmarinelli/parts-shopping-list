import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useExchangeRates, useUpdateExchangeRates } from '@/hooks/use-exchange-rates';

interface ExchangeRatesModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  availableCurrencies: string[];
}

interface CurrencyPair {
  from: string;
  to: string;
  defaultRate: string;
}

function generatePairs(
  currencies: string[],
  existingRates: { fromCurrency: string; toCurrency: string; rate: number }[] | undefined,
): CurrencyPair[] {
  const pairs: CurrencyPair[] = [];
  const others = currencies.filter((c) => c !== 'USD');

  // Always show as USD → XXX when USD is present
  if (currencies.includes('USD')) {
    for (const to of others) {
      const existing = existingRates?.find(
        (r) =>
          (r.fromCurrency === 'USD' && r.toCurrency === to) ||
          (r.fromCurrency === to && r.toCurrency === 'USD'),
      );
      let defaultRate = '';
      if (existing) {
        defaultRate =
          existing.fromCurrency === 'USD'
            ? String(existing.rate)
            : String(1 / existing.rate);
      }
      pairs.push({ from: 'USD', to, defaultRate });
    }
  }

  // Also generate pairs between non-USD currencies
  for (let i = 0; i < others.length; i++) {
    for (let j = i + 1; j < others.length; j++) {
      const from = others[i];
      const to = others[j];
      const existing = existingRates?.find(
        (r) =>
          (r.fromCurrency === from && r.toCurrency === to) ||
          (r.fromCurrency === to && r.toCurrency === from),
      );
      let defaultRate = '';
      if (existing) {
        defaultRate =
          existing.fromCurrency === from
            ? String(existing.rate)
            : String(1 / existing.rate);
      }
      pairs.push({ from, to, defaultRate });
    }
  }

  return pairs;
}

export function ExchangeRatesModal({
  open,
  onClose,
  projectId,
  availableCurrencies,
}: ExchangeRatesModalProps) {
  const { data: existingRates } = useExchangeRates(projectId);
  const updateRates = useUpdateExchangeRates();

  const pairs = useMemo(
    () => generatePairs(availableCurrencies, existingRates),
    [availableCurrencies, existingRates],
  );

  // Track user edits separately from computed defaults
  const [rateOverrides, setRateOverrides] = useState<Record<string, string>>({});

  function pairKey(from: string, to: string) {
    return `${from}-${to}`;
  }

  function getRateValue(pair: CurrencyPair): string {
    const key = pairKey(pair.from, pair.to);
    return key in rateOverrides ? rateOverrides[key] : pair.defaultRate;
  }

  function handleRateChange(pair: CurrencyPair, value: string) {
    setRateOverrides((prev) => ({
      ...prev,
      [pairKey(pair.from, pair.to)]: value,
    }));
  }

  function handleSave() {
    const validRates = pairs
      .map((p) => {
        const rateStr = getRateValue(p);
        const rate = parseFloat(rateStr);
        if (!rateStr || isNaN(rate) || rate <= 0) return null;
        return { fromCurrency: p.from, toCurrency: p.to, rate };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    updateRates.mutate(
      { projectId, rates: validRates },
      {
        onSuccess: () => {
          setRateOverrides({});
          onClose();
        },
      },
    );
  }

  function handleClose() {
    setRateOverrides({});
    onClose();
  }

  const labelClass =
    'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wide text-secondary';
  const inputClass =
    'w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Exchange Rates"
      description="Set conversion rates between currencies used in this project."
    >
      {pairs.length === 0 ? (
        <p className="text-sm text-muted">
          No currency pairs to configure. Add options with different currencies first.
        </p>
      ) : (
        <div className="space-y-4">
          {pairs.map((pair) => (
            <div key={pairKey(pair.from, pair.to)}>
              <label className={labelClass}>
                1 {pair.from} = ? {pair.to}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={getRateValue(pair)}
                onChange={(e) => handleRateChange(pair, e.target.value)}
                placeholder={`Rate for ${pair.from} to ${pair.to}`}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="rounded border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-primary transition-all duration-150 hover:bg-surface-hover active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={updateRates.isPending}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-all duration-150 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
        >
          {updateRates.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
