import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Option } from '@/types';

interface OptionFormProps {
  option?: Option;
  onSubmit: (data: {
    name: string;
    firstPart?: {
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    };
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}

function OptionFormInner({ option, onSubmit, onCancel, isPending }: OptionFormProps) {
  const isEditMode = !!option;

  const [name, setName] = useState(option?.name ?? '');

  // First part fields (create mode only)
  const [partName, setPartName] = useState('');
  const [partPrice, setPartPrice] = useState('');
  const [partCurrency, setPartCurrency] = useState('USD');
  const [partSource, setPartSource] = useState('');
  const [partLink, setPartLink] = useState('');
  const [partComment, setPartComment] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (isEditMode) {
      onSubmit({ name: trimmedName });
      return;
    }

    // Create mode: validate first part
    const trimmedPartName = partName.trim();
    const parsedPrice = parseFloat(partPrice);
    const trimmedCurrency = partCurrency.trim();

    if (!trimmedPartName || isNaN(parsedPrice) || parsedPrice < 0 || !trimmedCurrency) return;

    onSubmit({
      name: trimmedName,
      firstPart: {
        name: trimmedPartName,
        price: parsedPrice,
        currency: trimmedCurrency.toUpperCase(),
        source: partSource.trim() || undefined,
        link: partLink.trim() || undefined,
        comment: partComment.trim() || undefined,
      },
    });
  }

  const labelClass =
    'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wide text-secondary';
  const inputClass =
    'w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary outline-none placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/10';

  const isValid = isEditMode
    ? !!name.trim()
    : !!(
        name.trim() &&
        partName.trim() &&
        !isNaN(parseFloat(partPrice)) &&
        parseFloat(partPrice) >= 0 &&
        partCurrency.trim()
      );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Option Name */}
      <div>
        <label className={labelClass}>Option Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kit Rein"
          autoFocus
          className={inputClass}
        />
      </div>

      {/* First part fields (create mode only) */}
      {!isEditMode && (
        <>
          <div className="border-t border-border-subtle pt-3">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
              First Part
            </p>
          </div>

          {/* Part Name */}
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="e.g. Complete Hose Set"
              className={inputClass}
            />
          </div>

          {/* Price + Currency row */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={partPrice}
                onChange={(e) => setPartPrice(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div className="w-24">
              <label className={labelClass}>Currency *</label>
              <input
                type="text"
                value={partCurrency}
                onChange={(e) => setPartCurrency(e.target.value)}
                placeholder="USD"
                maxLength={10}
                className={inputClass}
              />
            </div>
          </div>

          {/* Source */}
          <div>
            <label className={labelClass}>Source</label>
            <input
              type="text"
              value={partSource}
              onChange={(e) => setPartSource(e.target.value)}
              placeholder="e.g. FCP Euro"
              className={inputClass}
            />
          </div>

          {/* Link */}
          <div>
            <label className={labelClass}>Link</label>
            <input
              type="text"
              value={partLink}
              onChange={(e) => setPartLink(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* Comment */}
          <div>
            <label className={labelClass}>Comment</label>
            <input
              type="text"
              value={partComment}
              onChange={(e) => setPartComment(e.target.value)}
              placeholder="Additional notes..."
              className={inputClass}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!isValid || isPending}
        >
          Save
        </Button>
      </div>
    </form>
  );
}

export function OptionForm(props: OptionFormProps) {
  return <OptionFormInner key={props.option?.id ?? 'create'} {...props} />;
}
