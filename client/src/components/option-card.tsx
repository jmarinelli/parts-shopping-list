import { useState } from 'react';
import {
  ArrowSquareOut,
  PencilSimple,
  Trash,
  Plus,
} from '@phosphor-icons/react';
import { PartForm } from '@/components/part-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Option, Part } from '@/types';

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  isAutoSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreatePart: (data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) => void;
  onUpdatePart: (
    partId: string,
    data: {
      name?: string;
      price?: number;
      currency?: string;
      source?: string | null;
      link?: string | null;
      comment?: string | null;
      status?: 'pending' | 'ordered' | 'owned';
    },
  ) => void;
  onDeletePart: (partId: string) => void;
  isCreatingPart: boolean;
  isUpdatingPart: boolean;
}

const statusStyles: Record<string, string> = {
  pending:
    'bg-[rgba(245,158,11,0.08)] text-amber-400 border-[rgba(245,158,11,0.2)]',
  ordered:
    'bg-[rgba(59,130,246,0.08)] text-blue-400 border-[rgba(59,130,246,0.2)]',
  owned:
    'bg-[rgba(34,197,94,0.08)] text-green-400 border-[rgba(34,197,94,0.2)]',
};

function computeTotal(parts: Part[]): string {
  const byCurrency: Record<string, number> = {};
  for (const part of parts) {
    byCurrency[part.currency] = (byCurrency[part.currency] ?? 0) + Number(part.price);
  }
  const entries = Object.entries(byCurrency);
  if (entries.length === 0) return '$0.00';
  if (entries.length === 1) {
    const [cur, total] = entries[0];
    return `$${total.toFixed(2)} ${cur}`;
  }
  return entries.map(([cur, total]) => `$${total.toFixed(2)} ${cur}`).join(' + ');
}

export function OptionCard({
  option,
  isSelected,
  isAutoSelected,
  onSelect,
  onEdit,
  onDelete,
  onCreatePart,
  onUpdatePart,
  onDeletePart,
  isCreatingPart,
  isUpdatingPart,
}: OptionCardProps) {
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletePartModal, setDeletePartModal] = useState<{
    open: boolean;
    part?: Part;
  }>({ open: false });

  return (
    <div
      className={`group/card rounded-md border p-3 transition-[border-color,background] duration-150 ${
        isSelected
          ? 'border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)]'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-raised'
      }`}
    >
      {/* Option header */}
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
          {/* Name + computed total */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-primary">
              {option.name}
            </span>
            <span className="shrink-0 font-mono text-sm font-medium text-amber-500">
              {computeTotal(option.parts)}
            </span>
          </div>

          {/* Auto-selected note */}
          {isAutoSelected && (
            <p className="mt-1 font-mono text-[11px] text-muted">
              Auto-selected (only option)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100">
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

      {/* Parts list */}
      {option.parts.length > 0 && (
        <div className="ml-7 mt-2 space-y-2">
          {option.parts.map((part) =>
            editingPart?.id === part.id ? (
              <div
                key={part.id}
                className="rounded-md border border-border bg-surface p-3"
              >
                <h4 className="mb-2 text-xs font-medium text-secondary">
                  Edit Part
                </h4>
                <PartForm
                  part={part}
                  onSubmit={(data) => {
                    onUpdatePart(part.id, data);
                    setEditingPart(null);
                  }}
                  onCancel={() => setEditingPart(null)}
                  isPending={isUpdatingPart}
                />
              </div>
            ) : (
              <div key={part.id} className="group/part">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">
                      {part.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-xs text-muted">
                      <span className="font-medium text-amber-500">
                        ${Number(part.price).toFixed(2)} {part.currency}
                      </span>
                      {part.source && (
                        <>
                          <span className="text-border-strong">·</span>
                          <span>{part.source}</span>
                        </>
                      )}
                      <span className="text-border-strong">·</span>
                      <select
                        value={part.status}
                        onChange={(e) =>
                          onUpdatePart(part.id, {
                            status: e.target.value as Part['status'],
                          })
                        }
                        className={`cursor-pointer appearance-none rounded border px-1.5 py-0 font-mono text-[11px] font-medium uppercase tracking-wide outline-none ${statusStyles[part.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="ordered">Ordered</option>
                        <option value="owned">Owned</option>
                      </select>
                    </div>

                    {/* Link */}
                    {part.link && (
                      <div className="mt-0.5">
                        <a
                          href={part.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 font-mono text-xs text-muted transition-colors duration-150 hover:text-primary"
                        >
                          view listing
                          <ArrowSquareOut size={11} />
                        </a>
                      </div>
                    )}

                    {/* Comment */}
                    {part.comment && (
                      <p className="mt-0.5 text-xs text-secondary">
                        {part.comment}
                      </p>
                    )}
                  </div>

                  {/* Part actions */}
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover/part:opacity-100">
                    <button
                      onClick={() => setEditingPart(part)}
                      className="rounded p-1 text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-primary"
                    >
                      <PencilSimple size={12} />
                    </button>
                    <button
                      onClick={() =>
                        setDeletePartModal({ open: true, part })
                      }
                      className="rounded p-1 text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-destructive"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Add Part form / button */}
      <div className="ml-7 mt-2">
        {isAddingPart ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <h4 className="mb-2 text-xs font-medium text-secondary">
              New Part
            </h4>
            <PartForm
              onSubmit={(data) => {
                onCreatePart(data);
                setIsAddingPart(false);
              }}
              onCancel={() => setIsAddingPart(false)}
              isPending={isCreatingPart}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPart(true)}
            className="inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors duration-150 hover:text-primary"
          >
            <Plus size={12} weight="bold" />
            Add Part
          </button>
        )}
      </div>

      {/* Delete part confirmation modal */}
      <Modal
        open={deletePartModal.open}
        onClose={() => setDeletePartModal({ open: false })}
        title={`Delete ${deletePartModal.part?.name ?? ''}?`}
        description="This will permanently delete this part. This action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeletePartModal({ open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (deletePartModal.part) {
                onDeletePart(deletePartModal.part.id);
                setDeletePartModal({ open: false });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
