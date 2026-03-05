I want to implement Phase 5 (Frontend: Components & Page) of the Part Groups epic. Read these files for full context:

- `CLAUDE.md` — project conventions and structure
- `docs/ui-spec.md` — UI patterns (side panel, parts list, option cards)
- `docs/design-system.md` — colors, typography, component styles, and visual patterns
- `docs/epics/part-groups/implementation-plan.md` — overview of the full epic
- `docs/epics/part-groups/specs/05-frontend-components-page.md` — detailed spec with component props, layout diagrams, visual verification checklist, and Definition of Done

Key context from previous phases:
- Phases 1-4 are complete: all backend endpoints work, frontend types (`PartGroup`, `Option`, `Part`) and hooks (`usePartGroups`, `useOptions`, `useParts`) are ready.
- The existing components must be **rewritten** to work with the new three-level hierarchy.
- Follow the `design-taste-frontend` skill (DESIGN_VARIANCE=3, MOTION_INTENSITY=4, VISUAL_DENSITY=4).
- Follow existing design patterns — look at the current component implementations for styling conventions (amber accent, status colors, monospace prices, hover effects, etc.).

Key changes from the current implementation:

1. **`parts-list.tsx`** and **`part-row.tsx`**: work with `PartGroup[]`. Status is a **read-only badge** (computed, not a dropdown). Selected option column shows option name + computed price.

2. **`options-panel.tsx`** (major rewrite): the panel now manages two levels — options and their nested parts. Header loses the status dropdown (computed status shown as read-only badge). No status `<select>`.

3. **`option-card.tsx`** (major rewrite): each option card now shows its list of parts. Each part has an **editable status dropdown**, price, currency, source, link, comment. "Add Part" button within each option. Computed total price shown in the option header.

4. **`option-form.tsx`** (modified): create mode collects option name + first part fields (compound form). Edit mode only shows option name.

5. **`part-form.tsx`** (new): form for creating/editing individual parts within an option. Same field layout as the part fields in option-form (name, price, currency, source, link, comment).

6. **`project-detail.tsx`**: replace all `useParts`/`useUpdatePart` hooks with `usePartGroups`/`useUpdatePartGroup`. Add `useCreatePart`/`useUpdatePart`/`useDeletePart` for the leaf entity. Wire all callbacks down to components.

Key UX decisions:
- Status only lives on Part (leaf entity) — user changes it via dropdown in the option card.
- Part Group status is **always computed** (min of parts statuses) and shown as read-only.
- "Add Option" opens a compound form: option name + first part fields in one submission.
- "Add Part" within an option opens `PartForm` inline.
- Totals banner and exchange rates modal are **unchanged**.

This is the most complex phase. Take it component by component:
1. First update `project-detail.tsx` with new hooks and state.
2. Then update `parts-list.tsx` and `part-row.tsx` for PartGroup.
3. Then create `part-form.tsx`.
4. Then rewrite `option-form.tsx` for compound creation.
5. Then rewrite `option-card.tsx` with nested parts.
6. Finally rewrite `options-panel.tsx` to wire everything together.

Implement ONLY Phase 5. Follow the Definition of Done section in the spec — it includes a detailed step-by-step visual verification checklist and keyboard interaction tests. Make sure `cd client && npx tsc --noEmit` and `cd client && npx eslint src/` pass.
