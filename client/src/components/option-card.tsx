import { ArrowSquareOut, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Option } from '@/types';

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  isAutoSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatPrice(price: number, currency: string) {
  return `$${Number(price).toFixed(2)} ${currency}`;
}

export function OptionCard({
  option,
  isSelected,
  isAutoSelected,
  onSelect,
  onEdit,
  onDelete,
}: OptionCardProps) {
  return (
    <div
      className={`group rounded-md border p-3 transition-[border-color,background] duration-150 ${
        isSelected
          ? 'border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)]'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-raised'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Radio button */}
        <button
          onClick={onSelect}
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150"
          style={{
            borderColor: isSelected ? '#f59e0b' : '#3a3a3d',
          }}
        >
          {isSelected && (
            <div className="h-2 w-2 rounded-full bg-amber-500" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {/* Name + price */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-primary">
              {option.name}
            </span>
            <span className="shrink-0 font-mono text-sm font-medium text-amber-500">
              {formatPrice(option.price, option.currency)}
            </span>
          </div>

          {/* Metadata line */}
          {(option.source || option.link) && (
            <div className="mt-1 flex items-center gap-1 font-mono text-xs text-muted">
              {option.source && <span>{option.source}</span>}
              {option.source && option.link && (
                <span className="text-border-strong">{'//'}</span>
              )}
              {option.link && (
                <a
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-muted transition-colors duration-150 hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  view listing
                  <ArrowSquareOut size={11} />
                </a>
              )}
            </div>
          )}

          {/* Comment */}
          {option.comment && (
            <p className="mt-1 text-xs text-secondary">{option.comment}</p>
          )}

          {/* Auto-selected note */}
          {isAutoSelected && (
            <p className="mt-1.5 font-mono text-[11px] text-muted">
              Auto-selected (only option)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded p-1 text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-primary"
          >
            <PencilSimple size={14} />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-destructive"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
