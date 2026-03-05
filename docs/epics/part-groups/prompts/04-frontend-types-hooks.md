I want to implement Phase 4 (Frontend: Types & Hooks) of the Part Groups epic. Read these files for full context:

- `CLAUDE.md` — project conventions, naming rules (hooks use `use` prefix, files are kebab-case)
- `docs/epics/part-groups/implementation-plan.md` — overview of the full epic
- `docs/epics/part-groups/specs/04-frontend-types-hooks.md` — detailed spec with TypeScript types, hook signatures, cache invalidation strategy, and Definition of Done

Key context from previous phases:
- Phases 1-3 are complete: all backend endpoints for part groups, options, and parts are functional.
- The existing frontend hooks in `client/src/hooks/use-parts.ts` and `client/src/hooks/use-options.ts` need to be **replaced**.
- Follow the exact same patterns established in `client/src/hooks/use-cars.ts` and `client/src/hooks/use-projects.ts` for hook structure.
- The API client in `client/src/services/api.ts` is unchanged — use the same `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete` methods.

Key changes:
- **Types**: replace `Part` and `Option` interfaces in `client/src/types/index.ts` with `PartGroup`, `Option` (with embedded `parts: Part[]`), and `Part` (leaf entity with price/currency/source/link/comment/status).
- **`use-part-groups.ts`** (new, replaces old `use-parts.ts`): hooks for part group CRUD + reorder. The `useReorderPartGroups` hook must implement **optimistic updates** with rollback (carry over the pattern from the current `useReorderParts`).
- **`use-options.ts`** (modified): references `partGroupId` instead of `partId`. `useCreateOption` sends compound payload `{ name, firstPart: {...} }`. `useUpdateOption` sends only `{ name? }`.
- **`use-parts.ts`** (new, for leaf entity): hooks for CRUD on individual parts within options. Includes status updates.

Critical cache invalidation:
- Part mutations must invalidate upward: `['parts', optionId]`, `['options', partGroupId]`, `['part-groups', projectId]`, `['totals', projectId]`.
- Option mutations: `['options', partGroupId]`, `['part-groups', projectId]`, `['totals', projectId]`.
- Part group mutations: `['part-groups', projectId]`, `['totals', projectId]`.
- All mutations must carry enough context (optionId, partGroupId, projectId) in their variables for proper invalidation.

Hooks unchanged: `use-cars.ts`, `use-projects.ts`, `use-exchange-rates.ts`, `use-totals.ts`.

**Important**: After this phase, component files will have TypeScript errors because they still reference old types — that is expected and will be fixed in Phase 5.

Implement ONLY Phase 4 — do not modify any component or page files. Make sure the types and hooks compile: `cd client && npx tsc --noEmit` (component errors from old references are expected at this stage).
