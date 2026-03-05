import { useState } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { useTotals } from '@/hooks/use-totals';

interface TotalsBannerProps {
  projectId: string;
  onOpenExchangeRates: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TotalsBanner({
  projectId,
  onOpenExchangeRates,
}: TotalsBannerProps) {
  const [userCurrency, setUserCurrency] = useState<string | null>(
    () => localStorage.getItem('preferredCurrency'),
  );

  function handleCurrencyChange(currency: string) {
    setUserCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
  }
  const [includeOptionals, setIncludeOptionals] = useState(true);

  const { data: totals, error, isError } = useTotals(
    projectId,
    userCurrency,
    includeOptionals,
  );

  const availableCurrencies = totals?.availableCurrencies ?? [];
  const displayCurrency = totals?.currency || 'USD';
  const isMissingRate = isError && error?.message?.startsWith('Missing exchange rate');

  return (
    <div className="sticky top-0 z-10 -mx-6 mb-6 overflow-hidden border-b border-border bg-bg/80 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <div>
            <span className="block font-mono text-[11px] font-medium uppercase tracking-wide text-muted">
              Total
            </span>
            <span className="font-mono text-sm font-medium text-primary">
              {isMissingRate ? '—' : formatCurrency(totals?.total ?? 0, displayCurrency)}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="block font-mono text-[11px] font-medium uppercase tracking-wide text-muted">
              Spent
            </span>
            <span className="font-mono text-sm font-medium text-green-400">
              {isMissingRate ? '—' : formatCurrency(totals?.spent ?? 0, displayCurrency)}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="block font-mono text-[11px] font-medium uppercase tracking-wide text-muted">
              Remaining
            </span>
            <span className="font-mono text-sm font-medium text-amber-500">
              {isMissingRate ? '—' : formatCurrency(totals?.remaining ?? 0, displayCurrency)}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {availableCurrencies.length > 1 && (
            <select
              value={displayCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs text-primary focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {availableCurrencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={includeOptionals}
              onChange={(e) => setIncludeOptionals(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border bg-surface accent-amber-500"
            />
            <span className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-wide text-secondary">
              Include optionals
            </span>
          </label>
        </div>
      </div>

      {isMissingRate && (
        <div className="mt-2 flex items-center gap-2 rounded border border-amber-500/20 bg-amber-500/8 px-3 py-2">
          <WarningCircle weight="fill" className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-xs text-amber-400">{error.message}.</span>
          <button
            onClick={onOpenExchangeRates}
            className="text-xs font-medium text-amber-500 underline underline-offset-2 transition-colors duration-150 hover:text-amber-400"
          >
            Configure rates
          </button>
        </div>
      )}
    </div>
  );
}
