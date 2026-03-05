import { useNavigate } from 'react-router-dom';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { Car } from '@/types';

interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export function CarCard({ car, onEdit, onDelete }: CarCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer rounded-md border border-border bg-surface p-[18px] transition-[border-color,background] duration-150 hover:border-border-strong hover:bg-surface-raised"
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="mb-3.5 text-[15px] font-semibold tracking-tight">
        {car.name}
      </div>
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(car);
          }}
        >
          <PencilSimple size={14} />
          <span>Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(car);
          }}
        >
          <Trash size={14} />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
}
