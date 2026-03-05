import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import type { Part } from '@/types';

interface PartRowProps {
  part: Part;
  isSelected: boolean;
  onSelect: (part: Part) => void;
  onStatusChange: (partId: string, status: Part['status']) => void;
  onDelete: (part: Part) => void;
}

const statusStyles: Record<Part['status'], string> = {
  pending:
    'bg-[rgba(245,158,11,0.08)] text-amber-400 border-[rgba(245,158,11,0.2)]',
  ordered:
    'bg-[rgba(59,130,246,0.08)] text-blue-400 border-[rgba(59,130,246,0.2)]',
  owned:
    'bg-[rgba(34,197,94,0.08)] text-green-400 border-[rgba(34,197,94,0.2)]',
};

function formatPrice(price: number, currency: string) {
  return `$${Number(price).toFixed(2)} ${currency}`;
}

export function PartRow({
  part,
  isSelected,
  onSelect,
  onStatusChange,
  onDelete,
}: PartRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 border-b border-border-subtle px-3 py-2.5 transition-[background,border-color] duration-150 ${
        isDragging ? 'z-10 bg-surface-raised opacity-80' : ''
      } ${
        isSelected
          ? 'bg-[rgba(245,158,11,0.08)]'
          : 'hover:bg-surface-hover'
      }`}
    >
      {/* Drag handle */}
      <button
        className="shrink-0 cursor-grab touch-none text-muted hover:text-secondary active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <DotsSixVertical size={16} weight="bold" />
      </button>

      {/* Name — clickable to open side panel */}
      <button
        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-primary"
        onClick={() => onSelect(part)}
      >
        {part.name}
      </button>

      {/* Status badge */}
      <select
        value={part.status}
        onChange={(e) =>
          onStatusChange(part.id, e.target.value as Part['status'])
        }
        onClick={(e) => e.stopPropagation()}
        className={`shrink-0 cursor-pointer appearance-none rounded border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide outline-none ${statusStyles[part.status]}`}
      >
        <option value="pending">Pending</option>
        <option value="ordered">Ordered</option>
        <option value="owned">Owned</option>
      </select>

      {/* Selected option summary — price only on mobile, full on desktop */}
      {part.selectedOption ? (
        <>
          <span className="shrink-0 truncate font-mono text-xs font-medium text-amber-500 sm:hidden">
            {formatPrice(part.selectedOption.price, part.selectedOption.currency)}
          </span>
          <span className="hidden w-80 shrink-0 truncate text-right font-mono text-sm sm:block">
            <span className="font-medium text-amber-500">
              {part.selectedOption.name} — {formatPrice(part.selectedOption.price, part.selectedOption.currency)}
            </span>
          </span>
        </>
      ) : (
        <span className="hidden w-40 shrink-0 truncate text-right font-mono text-sm text-muted sm:block">
          Unquoted
        </span>
      )}

      {/* Delete */}
      <button
        className="shrink-0 text-muted transition-colors duration-150 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(part);
        }}
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
