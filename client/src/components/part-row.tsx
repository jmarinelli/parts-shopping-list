import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import type { PartGroup } from '@/types';

interface PartRowProps {
  partGroup: PartGroup;
  isSelected: boolean;
  onSelect: (pg: PartGroup) => void;
  onDelete: (pg: PartGroup) => void;
}

const statusStyles: Record<string, string> = {
  pending:
    'bg-[rgba(245,158,11,0.08)] text-amber-400 border-[rgba(245,158,11,0.2)]',
  ordered:
    'bg-[rgba(59,130,246,0.08)] text-blue-400 border-[rgba(59,130,246,0.2)]',
  owned:
    'bg-[rgba(34,197,94,0.08)] text-green-400 border-[rgba(34,197,94,0.2)]',
};

function formatOptionSummary(selectedOption: PartGroup['selectedOption']): string {
  if (!selectedOption) return '';
  const { name, computedPrice, currencies } = selectedOption;
  if (computedPrice !== null && currencies.length === 1) {
    return `${name} — $${computedPrice.toFixed(2)} ${currencies[0]}`;
  }
  if (currencies.length > 1) {
    return `${name} — Mixed currencies`;
  }
  return name;
}

export function PartRow({
  partGroup,
  isSelected,
  onSelect,
  onDelete,
}: PartRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partGroup.id });

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
        onClick={() => onSelect(partGroup)}
      >
        {partGroup.name}
      </button>

      {/* Status badge — read-only computed */}
      {partGroup.computedStatus ? (
        <span
          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${statusStyles[partGroup.computedStatus]}`}
        >
          {partGroup.computedStatus}
        </span>
      ) : (
        <span className="shrink-0 font-mono text-[11px] text-muted">—</span>
      )}

      {/* Selected option summary */}
      {partGroup.selectedOption ? (
        <>
          <span className="shrink-0 truncate font-mono text-xs font-medium text-amber-500 sm:hidden">
            {partGroup.selectedOption.computedPrice !== null && partGroup.selectedOption.currencies.length === 1
              ? `$${partGroup.selectedOption.computedPrice.toFixed(2)} ${partGroup.selectedOption.currencies[0]}`
              : partGroup.selectedOption.name}
          </span>
          <span className="hidden w-80 shrink-0 truncate text-right font-mono text-sm sm:block">
            <span className="font-medium text-amber-500">
              {formatOptionSummary(partGroup.selectedOption)}
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
          onDelete(partGroup);
        }}
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
