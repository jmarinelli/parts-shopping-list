# Phase 4: Frontend — Types & Hooks

## Goal

Update all frontend TypeScript types, API service functions, and React Query hooks to match the new three-level data model.

## Prerequisites

- Phases 1-3 completed: all backend endpoints for part groups, options, and parts are functional.
- Existing frontend hooks and types for cars, projects, exchange rates, and totals are in place.

## Deliverables

### TypeScript Types

Replace the `Part` and `Option` interfaces in `client/src/types/index.ts`:

```typescript
// Unchanged
export interface Car { ... }
export interface Project { ... }
export interface ExchangeRate { ... }
export interface ProjectTotals { ... }

// NEW: leaf entity — individual item within an option
export interface Part {
  id: string;
  optionId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  status: 'pending' | 'ordered' | 'owned';
  createdAt: string;
  updatedAt: string;
}

// MODIFIED: option is now a container with parts
export interface Option {
  id: string;
  partGroupId: string;
  name: string;
  parts: Part[];
  createdAt: string;
  updatedAt: string;
}

// NEW: replaces old Part — container entity
export interface PartGroup {
  id: string;
  projectId: string;
  name: string;
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  computedStatus: 'pending' | 'ordered' | 'owned' | null;
  selectedOption: {
    id: string;
    name: string;
    computedPrice: number | null;
    currencies: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}
```

### React Query Hooks

#### `client/src/hooks/use-part-groups.ts` (new, replaces `use-parts.ts`)

```typescript
const PART_GROUPS_KEY = 'part-groups';

usePartGroups(projectId: string)
// GET /api/projects/:projectId/part-groups
// Query key: [PART_GROUPS_KEY, projectId]

useCreatePartGroup()
// POST /api/projects/:projectId/part-groups
// Body: { name: string; isOptional?: boolean }
// Mutation variables: { projectId, name, isOptional? }
// Invalidates: [PART_GROUPS_KEY, projectId], ['totals', projectId]

useUpdatePartGroup()
// PUT /api/part-groups/:partGroupId
// Body: { name?: string; isOptional?: boolean }
// Mutation variables: { partGroupId, projectId, name?, isOptional? }
// Invalidates: [PART_GROUPS_KEY, projectId], ['totals', projectId]

useDeletePartGroup()
// DELETE /api/part-groups/:partGroupId
// Mutation variables: { partGroupId, projectId }
// Invalidates: [PART_GROUPS_KEY, projectId], ['totals', projectId]

useReorderPartGroups()
// PATCH /api/projects/:projectId/part-groups/reorder
// Body: { orderedIds: string[] }
// Mutation variables: { projectId, orderedIds }
// Optimistic update on [PART_GROUPS_KEY, projectId] — same pattern as current useReorderParts
```

#### `client/src/hooks/use-options.ts` (modified)

```typescript
const OPTIONS_KEY = 'options';

useOptions(partGroupId: string)
// GET /api/part-groups/:partGroupId/options
// Query key: [OPTIONS_KEY, partGroupId]
// enabled: !!partGroupId

useCreateOption()
// POST /api/part-groups/:partGroupId/options
// Body: { name, firstPart: { name, price, currency, source?, link?, comment? } }
// Mutation variables: { partGroupId, projectId, name, firstPart: { ... } }
// Invalidates: [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId], ['totals', projectId]

useUpdateOption()
// PUT /api/options/:optionId
// Body: { name? }
// Mutation variables: { optionId, partGroupId, projectId, name? }
// Invalidates: [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId]

useDeleteOption()
// DELETE /api/options/:optionId
// Mutation variables: { optionId, partGroupId, projectId }
// Invalidates: [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId], ['totals', projectId]

useSelectOption()
// PATCH /api/part-groups/:partGroupId/options/:optionId/select
// Mutation variables: { partGroupId, optionId, projectId }
// Invalidates: [PART_GROUPS_KEY, projectId], ['totals', projectId]
```

#### `client/src/hooks/use-parts.ts` (new, for leaf entity)

```typescript
const PARTS_KEY = 'parts';

useParts(optionId: string)
// GET /api/options/:optionId/parts
// Query key: [PARTS_KEY, optionId]
// enabled: !!optionId

useCreatePart()
// POST /api/options/:optionId/parts
// Body: { name, price, currency, source?, link?, comment? }
// Mutation variables: { optionId, partGroupId, projectId, name, price, currency, source?, link?, comment? }
// Invalidates: [PARTS_KEY, optionId], [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId], ['totals', projectId]

useUpdatePart()
// PUT /api/parts/:partId
// Body: { name?, price?, currency?, source?, link?, comment?, status? }
// Mutation variables: { partId, optionId, partGroupId, projectId, ...fields }
// Invalidates: [PARTS_KEY, optionId], [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId], ['totals', projectId]

useDeletePart()
// DELETE /api/parts/:partId
// Mutation variables: { partId, optionId, partGroupId, projectId }
// Invalidates: [PARTS_KEY, optionId], [OPTIONS_KEY, partGroupId], [PART_GROUPS_KEY, projectId], ['totals', projectId]
```

### Files to Delete

- `client/src/hooks/use-parts.ts` (old) — replaced by `use-part-groups.ts`

The old `use-parts.ts` is deleted and a new `use-parts.ts` is created for the leaf entity. Effectively, the file is completely rewritten.

### Unchanged Hooks

- `client/src/hooks/use-cars.ts` — no changes
- `client/src/hooks/use-projects.ts` — no changes
- `client/src/hooks/use-exchange-rates.ts` — no changes
- `client/src/hooks/use-totals.ts` — no changes

### Client Structure

```
client/src/
├── types/
│   └── index.ts                # MODIFIED (new Part, Option, PartGroup types)
├── hooks/
│   ├── use-part-groups.ts      # NEW (replaces old use-parts.ts)
│   ├── use-options.ts          # MODIFIED (references partGroupId)
│   ├── use-parts.ts            # REWRITTEN (new leaf entity hooks)
│   ├── use-cars.ts             # unchanged
│   ├── use-projects.ts         # unchanged
│   ├── use-exchange-rates.ts   # unchanged
│   └── use-totals.ts           # unchanged
├── services/
│   └── api.ts                  # unchanged
```

### Cache Invalidation Strategy

Key principle: mutations at any level must invalidate all ancestor caches since computed fields (computedStatus, computedPrice) depend on descendant data.

```
Part mutation → invalidates: parts, options, part-groups, totals
Option mutation → invalidates: options, part-groups, totals
PartGroup mutation → invalidates: part-groups, totals
```

The `['totals', projectId]` key is always invalidated on any data mutation because totals depend on the full hierarchy.

## Definition of Done

### TypeScript Compilation

```bash
cd client && npx tsc --noEmit
# Must pass. Note: component files will have errors until Phase 5,
# so this check validates only the types and hooks compile correctly.
# Components that reference old types will break — that's expected.
```

To verify types and hooks in isolation without component errors, ensure:
- `client/src/types/index.ts` compiles
- All hook files in `client/src/hooks/` compile
- The `api.ts` service file still compiles

### Hook Smoke Test

After Phase 5 is complete, verify hooks work by:

1. `usePartGroups(projectId)` returns the list from Phase 2-3 backend
2. `useCreatePartGroup()` mutation creates and invalidates correctly
3. `useOptions(partGroupId)` returns options with embedded parts
4. `useCreateOption()` sends compound payload and invalidates
5. `useParts(optionId)` returns parts for an option
6. `useUpdatePart()` updates status and triggers re-fetch of part-groups (for computedStatus)

## Acceptance Criteria

- [ ] `PartGroup`, `Option`, and `Part` types accurately reflect the backend response shapes.
- [ ] `usePartGroups` hook fetches and caches part groups for a project.
- [ ] `useReorderPartGroups` implements optimistic updates with rollback.
- [ ] `useOptions` hook fetches options with embedded parts for a part group.
- [ ] `useCreateOption` sends compound payload (option name + first part data).
- [ ] `useParts` hook fetches parts for an option.
- [ ] `useUpdatePart` supports updating status and all other fields.
- [ ] All mutations carry enough context (optionId, partGroupId, projectId) for cache invalidation.
- [ ] Cache invalidation cascades upward: part mutations invalidate options, part-groups, and totals.
- [ ] Old `use-parts.ts` is replaced — no references to old `Part` type remain in hooks.
- [ ] All hook files compile without TypeScript errors.
- [ ] Error and success toast patterns are maintained on all mutations.
