import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Kanban } from '@phosphor-icons/react';
import { useCar } from '@/hooks/use-cars';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/use-projects';
import { ProjectCard } from '@/components/project-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Project } from '@/types';

export function CarDetailPage() {
  const { carId } = useParams<{ carId: string }>();
  const { data: car, isLoading: carLoading } = useCar(carId!);
  const { data: projects, isLoading: projectsLoading } = useProjects(carId!);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [formModal, setFormModal] = useState<{
    open: boolean;
    project?: Project;
  }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    project?: Project;
  }>({ open: false });
  const [name, setName] = useState('');

  function openCreate() {
    setName('');
    setFormModal({ open: true });
  }

  function openEdit(project: Project) {
    setName(project.name);
    setFormModal({ open: true, project });
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || !carId) return;

    if (formModal.project) {
      updateProject.mutate(
        { id: formModal.project.id, carId, data: { name: trimmed } },
        { onSuccess: () => setFormModal({ open: false }) },
      );
    } else {
      createProject.mutate(
        { carId, name: trimmed },
        { onSuccess: () => setFormModal({ open: false }) },
      );
    }
  }

  function handleDelete() {
    if (!deleteModal.project || !carId) return;
    deleteProject.mutate(
      { id: deleteModal.project.id, carId },
      { onSuccess: () => setDeleteModal({ open: false }) },
    );
  }

  const isLoading = carLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 h-4 w-40 rounded bg-surface-hover animate-skeleton" />
        <div className="mb-6 h-8 w-56 rounded bg-surface-hover animate-skeleton" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface px-4 py-3"
            >
              <div className="h-5 w-44 rounded bg-surface-hover animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: car?.name ?? '' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tighter">
          {car?.name}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} weight="bold" />
          <span>Add Project</span>
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDelete={(project) =>
                setDeleteModal({ open: true, project })
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface px-6 py-12 text-center">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-raised">
            <Kanban size={18} className="text-muted" />
          </div>
          <p className="text-sm font-medium">No projects yet</p>
          <p className="mb-4 font-mono text-xs text-muted">
            add your first project to start tracking parts
          </p>
          <Button variant="primary" size="sm" onClick={openCreate}>
            Add Project
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.project ? 'Edit Project' : 'Add Project'}
        description={
          formModal.project
            ? 'Update the name of your project.'
            : 'Enter a name for your new project.'
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
              placeholder="e.g. Cooling System Overhaul"
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
                !name.trim() ||
                createProject.isPending ||
                updateProject.isPending
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
        title={`Delete ${deleteModal.project?.name ?? ''}?`}
        description="Are you sure you want to delete this project? All parts and options within it will also be deleted. This action cannot be undone."
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
            disabled={deleteProject.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
