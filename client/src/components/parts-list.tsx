import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ListDashes } from '@phosphor-icons/react';
import { PartRow } from '@/components/part-row';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Part } from '@/types';

interface PartsListProps {
  parts: Part[];
  selectedPartId: string | null;
  onSelectPart: (part: Part) => void;
  onCreatePart: (name: string) => void;
  onStatusChange: (partId: string, status: Part['status']) => void;
  onDeletePart: (partId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  isCreating: boolean;
}

export function PartsList({
  parts,
  selectedPartId,
  onSelectPart,
  onCreatePart,
  onStatusChange,
  onDeletePart,
  onReorder,
  isCreating,
}: PartsListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; part?: Part }>({
    open: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parts.findIndex((p) => p.id === active.id);
    const newIndex = parts.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...parts];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((p) => p.id));
  }

  function handleAddSubmit() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewName('');
      return;
    }
    onCreatePart(trimmed);
    setNewName('');
    setIsAdding(false);
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubmit();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewName('');
    }
  }

  if (parts.length === 0 && !isAdding) {
    return (
      <div>
        <div className="rounded-md border border-border bg-surface px-6 py-12 text-center">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-raised">
            <ListDashes size={18} className="text-muted" />
          </div>
          <p className="text-sm font-medium">No parts yet</p>
          <p className="mb-4 font-mono text-xs text-muted">
            add your first part to start tracking
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            Add Part
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Parts table */}
      <div className="rounded-md border border-border bg-surface">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-3 py-2">
          <span className="w-4" />
          <span className="flex-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
            Name
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
            Status
          </span>
          <span className="hidden w-80 text-right font-mono text-[11px] font-semibold uppercase tracking-widest text-muted sm:block">
            Selected Option
          </span>
          <span className="w-4" />
        </div>

        {/* Sortable rows */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={parts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                isSelected={part.id === selectedPartId}
                onSelect={onSelectPart}
                onStatusChange={onStatusChange}
                onDelete={(part) => setDeleteModal({ open: true, part })}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Inline add row */}
        {isAdding && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="w-4" />
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleAddKeyDown}
              onBlur={handleAddSubmit}
              placeholder="Part name..."
              disabled={isCreating}
              className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
            />
          </div>
        )}
      </div>

      {/* Add Part button */}
      {!isAdding && (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={14} weight="bold" />
            <span>Add Part</span>
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title={`Delete ${deleteModal.part?.name ?? ''}?`}
        description="This will permanently delete this part and all its options. This action cannot be undone."
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
              if (deleteModal.part) {
                onDeletePart(deleteModal.part.id);
                setDeleteModal({ open: false });
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
