import { useState, useEffect, useRef } from 'react';
import { X, Plus, ListDashes } from '@phosphor-icons/react';
import { OptionCard } from '@/components/option-card';
import { OptionForm } from '@/components/option-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Part, Option } from '@/types';

interface OptionsPanelProps {
  part: Part;
  options: Option[] | undefined;
  isLoadingOptions: boolean;
  onClose: () => void;
  onUpdatePart: (data: { name?: string; status?: Part['status']; isOptional?: boolean }) => void;
  onCreateOption: (data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) => void;
  onUpdateOption: (
    optionId: string,
    data: {
      name?: string;
      price?: number;
      currency?: string;
      source?: string | null;
      link?: string | null;
      comment?: string | null;
    },
  ) => void;
  onDeleteOption: (optionId: string) => void;
  onSelectOption: (optionId: string) => void;
  isCreatingOption: boolean;
  isUpdatingOption: boolean;
}

const statusStyles: Record<Part['status'], string> = {
  pending:
    'bg-[rgba(245,158,11,0.08)] text-amber-400 border-[rgba(245,158,11,0.2)]',
  ordered:
    'bg-[rgba(59,130,246,0.08)] text-blue-400 border-[rgba(59,130,246,0.2)]',
  owned:
    'bg-[rgba(34,197,94,0.08)] text-green-400 border-[rgba(34,197,94,0.2)]',
};

export function OptionsPanel({
  part,
  options,
  isLoadingOptions,
  onClose,
  onUpdatePart,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
  onSelectOption,
  isCreatingOption,
  isUpdatingOption,
}: OptionsPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(part.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingOption, setEditingOption] = useState<Option | undefined>(undefined);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; option?: Option }>({
    open: false,
  });

  // Sync edit name with part name when not actively editing
  if (!isEditingName && editName !== part.name) {
    setEditName(part.name);
  }

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (formMode !== 'closed') {
          setFormMode('closed');
          setEditingOption(undefined);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, formMode]);

  // Focus name input when editing
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  function handleNameSubmit() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== part.name) {
      onUpdatePart({ name: trimmed });
    }
    setIsEditingName(false);
  }

  function handleOptionFormSubmit(data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) {
    if (formMode === 'edit' && editingOption) {
      onUpdateOption(editingOption.id, data);
    } else {
      onCreateOption(data);
    }
    setFormMode('closed');
    setEditingOption(undefined);
  }

  const isOnlyOption = options?.length === 1;

  return (
    <>
    {/* Backdrop for click-outside-to-close */}
    <div className="fixed inset-0 z-30" onClick={onClose} />
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l border-border bg-surface-raised transition-transform duration-200 ease-out">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="min-w-0 flex-1">
          {/* Part name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setEditName(part.name);
                  setIsEditingName(false);
                }
              }}
              className="w-full bg-transparent text-base font-semibold tracking-tight text-primary outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-left text-base font-semibold tracking-tight text-primary transition-colors duration-150 hover:text-accent"
            >
              {part.name}
            </button>
          )}

          {/* Status + Optional */}
          <div className="mt-2 flex items-center gap-2">
            <select
              value={part.status}
              onChange={(e) =>
                onUpdatePart({ status: e.target.value as Part['status'] })
              }
              className={`cursor-pointer appearance-none rounded border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide outline-none ${statusStyles[part.status]}`}
            >
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="owned">Owned</option>
            </select>

            <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-muted">
              <input
                type="checkbox"
                checked={part.isOptional}
                onChange={(e) => onUpdatePart({ isOptional: e.target.checked })}
                className="accent-amber-500"
              />
              Optional
            </label>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-primary"
        >
          <X size={18} />
        </button>
      </div>

      {/* Options list */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
          Sourcing Options
        </h3>

        {isLoadingOptions ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-md border border-border bg-surface animate-skeleton"
              />
            ))}
          </div>
        ) : options && options.length > 0 ? (
          <div className="space-y-3">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={part.selectedOptionId === option.id}
                isAutoSelected={
                  isOnlyOption && part.selectedOptionId === option.id
                }
                onSelect={() => onSelectOption(option.id)}
                onEdit={() => {
                  setEditingOption(option);
                  setFormMode('edit');
                }}
                onDelete={() => setDeleteModal({ open: true, option })}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-surface px-4 py-8 text-center">
            <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-raised">
              <ListDashes size={16} className="text-muted" />
            </div>
            <p className="text-sm font-medium">No options yet</p>
            <p className="font-mono text-xs text-muted">
              add sourcing options to compare
            </p>
          </div>
        )}

        {/* Option form */}
        {formMode !== 'closed' && (
          <div className="mt-3 rounded-md border border-border bg-surface p-3">
            <h4 className="mb-3 text-sm font-medium">
              {formMode === 'edit' ? 'Edit Option' : 'New Option'}
            </h4>
            <OptionForm
              option={editingOption}
              onSubmit={handleOptionFormSubmit}
              onCancel={() => {
                setFormMode('closed');
                setEditingOption(undefined);
              }}
              isPending={isCreatingOption || isUpdatingOption}
            />
          </div>
        )}

        {/* Add Option button */}
        {formMode === 'closed' && (
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingOption(undefined);
                setFormMode('create');
              }}
            >
              <Plus size={14} weight="bold" />
              <span>Add Option</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete option modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title={`Delete ${deleteModal.option?.name ?? ''}?`}
        description="This will permanently delete this option. This action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteModal({ open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (deleteModal.option) {
                onDeleteOption(deleteModal.option.id);
                setDeleteModal({ open: false });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
    </>
  );
}
