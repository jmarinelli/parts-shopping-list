I want to implement Phase 2 (Backend: Part Groups & Options) of the Part Groups epic. Read these files for full context:

- `CLAUDE.md` — project conventions, API format, and project structure
- `docs/epics/part-groups/implementation-plan.md` — overview of the full epic
- `docs/epics/part-groups/specs/02-backend-part-groups-options.md` — detailed spec with endpoints, response shapes, business logic, and Definition of Done

Key context from previous phases:
- Phase 1 is complete: `part_groups`, `options`, and `parts` tables exist in the database.
- The old `server/src/services/parts.ts` and `server/src/routes/parts.ts` need to be **deleted and replaced**.
- Server follows established patterns: routes/ → services/ → db/schema/. Response format is `{ data: ... }` / `{ error: { message: "..." } }`.
- Look at existing `server/src/services/cars.ts` and `server/src/routes/cars.ts` as reference for patterns.

Critical business logic to implement:
- **Compound option creation**: `POST /part-groups/:partGroupId/options` creates both the option AND its first part in a single **database transaction**. Request body: `{ name, firstPart: { name, price, currency, source?, link?, comment? } }`.
- **Auto-selection**: when a part group has exactly one option, it is automatically selected. This applies on option create (first option) and option delete (one remaining).
- **Computed fields on part group list**: the `GET /projects/:projectId/part-groups` response must include `computedStatus` (min status of selected option's parts) and `selectedOption` (with name, computedPrice, currencies). Compute these in the service layer by fetching parts for each selected option.
- **Status ordering**: `pending` < `ordered` < `owned`. The minimum status means: if any part is pending, the result is pending.
- **computedPrice**: sum of parts prices if all same currency, otherwise `null`. Always include `currencies` array with distinct currencies.
- **Reorder**: PATCH endpoint receives `{ orderedIds }` and updates `sort_order` column.
- **Options always return with embedded parts**: all option endpoints include the parts array in the response.

Files to create/modify:
- Delete `server/src/services/parts.ts` (old) → create `server/src/services/part-groups.ts`
- Delete `server/src/routes/parts.ts` (old) → create `server/src/routes/part-groups.ts`
- Rewrite `server/src/services/options.ts`
- Rewrite `server/src/routes/options.ts`
- Update `server/src/index.ts` router imports

**Do NOT** create the new `parts.ts` service/routes for the leaf entity — that is Phase 3.

Implement ONLY Phase 2. Follow the Definition of Done section in the spec — it includes curl scripts to test CRUD, compound creation, auto-selection, reorder, and error cases. Make sure `cd server && npx tsc --noEmit` passes.
