I want to implement Phase 3 (Frontend: Cars & Projects) of this project. Read these files for full context:

- `CLAUDE.md` — project conventions and structure
- `docs/tech-spec.md` — shared TypeScript types, error handling strategy
- `docs/ui-spec.md` — UI patterns (modals, cards, breadcrumb, confirm delete)
- `docs/implementation/specs/03-frontend-cars-projects.md` — detailed spec with React Query hooks, component structure, and Definition of Done

Key context from previous phases:
- Phases 1-2 are complete: backend CRUD for cars and projects is fully functional.
- React Router, React Query, shadcn/ui, Sonner, and Phosphor Icons are installed but not yet configured.

Key decisions already made:
- **State management**: React Query (TanStack Query) for all server state. No useState for API data.
- **Error handling**: toast notifications via Sonner. Success toasts on mutations, error toasts on failures.
- **UI components**: use shadcn/ui components (Dialog, Button, etc.) customized per `docs/design-system.md`.
- **Design system**: read `docs/design-system.md` for the dark industrial theme — dark backgrounds, amber accent, Geist + Geist Mono fonts, Phosphor icons, monospace-heavy labels. Reference `docs/examples/design-system-showcase.html` for visual guidance. Use the `design-taste-frontend` skill.
- **Naming**: hooks follow `useCars`, `useCreateCar`, `useUpdateCar`, `useDeleteCar` pattern.
- **Types**: define `Car` and `Project` interfaces in `types/index.ts` (see tech-spec.md for shapes).

Implement ONLY Phase 3 — do not start any other phase. Follow the Definition of Done section in the spec — it includes a step-by-step visual verification checklist.
