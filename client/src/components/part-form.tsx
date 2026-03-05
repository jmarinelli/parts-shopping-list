import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Part } from '@/types';

interface PartFormProps {
  part?: Part;
  onSubmit: (data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}

function PartFormInner({ part, onSubmit, onCancel, isPending }: PartFormProps) {
  const [name, setName] = useState(part?.name ?? '');
  const [price, setPrice] = useState(part ? String(part.price) : '');
  const [currency, setCurrency] = useState(part?.currency ?? 'USD');
  const [source, setSource] = useState(part?.source ?? '');
  const [link, setLink] = useState(part?.link ?? '');
  const [comment, setComment] = useState(part?.comment ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    const trimmedCurrency = currency.trim();

    if (!trimmedName || isNaN(parsedPrice) || parsedPrice < 0 || !trimmedCurrency) return;

    onSubmit({
      name: trimmedName,
      price: parsedPrice,
      currency: trimmedCurrency.toUpperCase(),
      source: source.trim() || undefined,
      link: link.trim() || undefined,
      comment: comment.trim() || undefined,
    });
  }

  const labelClass =
    'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wide text-secondary';
  const inputClass =
    'w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary outline-none placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/10';

  const isValid =
    name.trim() && !isNaN(parseFloat(price)) && parseFloat(price) >= 0 && currency.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name */}
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Upper Radiator Hose"
          autoFocus
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div className="w-24">
          <label className={labelClass}>Currency *</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
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
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. FCP Euro"
          className={inputClass}
        />
      </div>

      {/* Link */}
      <div>
        <label className={labelClass}>Link</label>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* Comment */}
      <div>
        <label className={labelClass}>Comment</label>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Additional notes..."
          className={inputClass}
        />
      </div>

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

export function PartForm(props: PartFormProps) {
  return <PartFormInner key={props.part?.id ?? 'create'} {...props} />;
}
