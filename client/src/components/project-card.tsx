import { useNavigate } from 'react-router-dom';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-surface px-4 py-3 transition-[border-color,background] duration-150 hover:border-border-strong hover:bg-surface-raised"
      onClick={() => navigate(`/cars/${project.carId}/projects/${project.id}`)}
    >
      <span className="text-sm font-medium tracking-tight">{project.name}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
        >
          <PencilSimple size={16} className="text-muted hover:text-secondary" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
          }}
        >
          <Trash size={16} className="text-muted hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
