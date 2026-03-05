import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GearSix } from '@phosphor-icons/react';
import { useCar } from '@/hooks/use-cars';
import { useProjects } from '@/hooks/use-projects';
import {
  useParts,
  useCreatePart,
  useUpdatePart,
  useDeletePart,
  useReorderParts,
} from '@/hooks/use-parts';
import {
  useOptions,
  useCreateOption,
  useUpdateOption,
  useDeleteOption,
  useSelectOption,
} from '@/hooks/use-options';
import { useTotals } from '@/hooks/use-totals';
import { ApiError } from '@/services/api';
import { PartsList } from '@/components/parts-list';
import { OptionsPanel } from '@/components/options-panel';
import { TotalsBanner } from '@/components/totals-banner';
import { ExchangeRatesModal } from '@/components/exchange-rates-modal';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { Part } from '@/types';

export function ProjectDetailPage() {
  const { carId, projectId } = useParams<{ carId: string; projectId: string }>();
  const { data: car, isLoading: carLoading } = useCar(carId!);
  const { data: projects, isLoading: projectsLoading } = useProjects(carId!);
  const { data: parts, isLoading: partsLoading } = useParts(projectId!);

  const createPart = useCreatePart();
  const updatePart = useUpdatePart();
  const deletePart = useDeletePart();
  const reorderParts = useReorderParts();

  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [exchangeRatesOpen, setExchangeRatesOpen] = useState(false);

  // Fetch totals to get available currencies (React Query deduplicates with TotalsBanner's query)
  const { data: totals, error: totalsError, isError: totalsIsError } = useTotals(projectId!, null, true);
  const availableCurrencies =
    totalsIsError && totalsError instanceof ApiError
      ? (totalsError.meta.availableCurrencies as string[]) ?? []
      : totals?.availableCurrencies ?? [];

  // Options hooks — only fetch when a part is selected
  const { data: options, isLoading: optionsLoading } = useOptions(
    selectedPart?.id ?? '',
  );
  const createOption = useCreateOption();
  const updateOption = useUpdateOption();
  const deleteOption = useDeleteOption();
  const selectOption = useSelectOption();

  const project = projects?.find((p) => p.id === projectId);
  const isLoading = carLoading || projectsLoading || partsLoading;

  // Keep selectedPart in sync with fresh data
  const freshSelectedPart = selectedPart
    ? parts?.find((p) => p.id === selectedPart.id) ?? null
    : null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 h-4 w-56 rounded bg-surface-hover animate-skeleton" />
        <div className="mb-6 h-8 w-64 rounded bg-surface-hover animate-skeleton" />
        <div className="rounded-md border border-border bg-surface">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-b border-border-subtle px-4 py-3"
            >
              <div className="h-5 w-44 rounded bg-surface-hover animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto max-w-7xl px-6 py-10 transition-[padding] duration-200 ${
        freshSelectedPart ? 'lg:pr-[440px]' : ''
      }`}
    >
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: car?.name ?? '', href: `/cars/${carId}` },
          { label: project?.name ?? '' },
        ]}
      />

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tighter">
          {project?.name}
        </h1>
        {availableCurrencies.length > 1 && (
          <button
            onClick={() => setExchangeRatesOpen(true)}
            className="rounded p-1 text-secondary transition-colors duration-150 hover:bg-surface-hover hover:text-primary"
            title="Exchange rates"
          >
            <GearSix weight="bold" className="h-5 w-5" />
          </button>
        )}
      </div>

      <TotalsBanner
        projectId={projectId!}
        onOpenExchangeRates={() => setExchangeRatesOpen(true)}
      />

      <PartsList
        parts={parts ?? []}
        selectedPartId={freshSelectedPart?.id ?? null}
        onSelectPart={(part) => setSelectedPart(part)}
        onCreatePart={(name) =>
          createPart.mutate({ projectId: projectId!, name })
        }
        onStatusChange={(partId, status) =>
          updatePart.mutate({
            id: partId,
            projectId: projectId!,
            data: { status },
          })
        }
        onDeletePart={(partId) => {
          if (selectedPart?.id === partId) setSelectedPart(null);
          deletePart.mutate({ id: partId, projectId: projectId! });
        }}
        onReorder={(orderedIds) =>
          reorderParts.mutate({ projectId: projectId!, orderedIds })
        }
        isCreating={createPart.isPending}
      />

      <ExchangeRatesModal
        open={exchangeRatesOpen}
        onClose={() => setExchangeRatesOpen(false)}
        projectId={projectId!}
        availableCurrencies={availableCurrencies}
      />

      {/* Side panel */}
      {freshSelectedPart && (
        <OptionsPanel
          part={freshSelectedPart}
          options={options}
          isLoadingOptions={optionsLoading}
          onClose={() => setSelectedPart(null)}
          onUpdatePart={(data) =>
            updatePart.mutate({
              id: freshSelectedPart.id,
              projectId: projectId!,
              data,
            })
          }
          onCreateOption={(data) =>
            createOption.mutate({
              partId: freshSelectedPart.id,
              projectId: projectId!,
              ...data,
            })
          }
          onUpdateOption={(optionId, data) =>
            updateOption.mutate({
              id: optionId,
              partId: freshSelectedPart.id,
              projectId: projectId!,
              data,
            })
          }
          onDeleteOption={(optionId) =>
            deleteOption.mutate({
              id: optionId,
              partId: freshSelectedPart.id,
              projectId: projectId!,
            })
          }
          onSelectOption={(optionId) =>
            selectOption.mutate({
              partId: freshSelectedPart.id,
              optionId,
              projectId: projectId!,
            })
          }
          isCreatingOption={createOption.isPending}
          isUpdatingOption={updateOption.isPending}
        />
      )}
    </div>
  );
}
