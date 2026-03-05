import { useState } from 'react';
import { Plus, Car as CarIcon } from '@phosphor-icons/react';
import { useCars, useCreateCar, useUpdateCar, useDeleteCar } from '@/hooks/use-cars';
import { CarCard } from '@/components/car-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Car } from '@/types';

export function HomePage() {
  const { data: cars, isLoading } = useCars();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();

  const [formModal, setFormModal] = useState<{ open: boolean; car?: Car }>({
    open: false,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; car?: Car }>({
    open: false,
  });
  const [name, setName] = useState('');

  function openCreate() {
    setName('');
    setFormModal({ open: true });
  }

  function openEdit(car: Car) {
    setName(car.name);
    setFormModal({ open: true, car });
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (formModal.car) {
      updateCar.mutate(
        { id: formModal.car.id, data: { name: trimmed } },
        { onSuccess: () => setFormModal({ open: false }) },
      );
    } else {
      createCar.mutate(
        { name: trimmed },
        { onSuccess: () => setFormModal({ open: false }) },
      );
    }
  }

  function handleDelete() {
    if (!deleteModal.car) return;
    deleteCar.mutate(deleteModal.car.id, {
      onSuccess: () => setDeleteModal({ open: false }),
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 h-8 w-48 rounded bg-surface-hover animate-skeleton" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface p-[18px]"
            >
              <div className="mb-3 h-5 w-36 rounded bg-surface-hover animate-skeleton" />
              <div className="h-4 w-24 rounded bg-surface-hover animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tighter">My Cars</h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} weight="bold" />
          <span>Add Car</span>
        </Button>
      </div>

      {cars && cars.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onEdit={openEdit}
              onDelete={(car) => setDeleteModal({ open: true, car })}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface px-6 py-12 text-center">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-raised">
            <CarIcon size={18} className="text-muted" />
          </div>
          <p className="text-sm font-medium">No cars yet</p>
          <p className="mb-4 font-mono text-xs text-muted">
            add your first car to start tracking
          </p>
          <Button variant="primary" size="sm" onClick={openCreate}>
            Add Car
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.car ? 'Edit Car' : 'Add Car'}
        description={
          formModal.car
            ? 'Update the name of your vehicle.'
            : 'Enter the name or description of your vehicle.'
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wide text-secondary">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BMW E36 328i"
              autoFocus
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary outline-none placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormModal({ open: false })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={
                !name.trim() || createCar.isPending || updateCar.isPending
              }
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title={`Delete ${deleteModal.car?.name ?? ''}?`}
        description="This will permanently delete this car and all its projects, parts, and options. This action cannot be undone."
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
            onClick={handleDelete}
            disabled={deleteCar.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
