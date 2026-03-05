I want to implement Phase 3 (Backend: Parts & Totals) of the Part Groups epic. Read these files for full context:

- `CLAUDE.md` — project conventions, API format, and project structure
- `docs/epics/part-groups/implementation-plan.md` — overview of the full epic
- `docs/epics/part-groups/specs/03-backend-parts-totals.md` — detailed spec with endpoints, totals calculation logic, and Definition of Done
- `docs/project-spec.md` — business rules for totals, currencies, and exchange rates

Key context from previous phases:
- Phases 1-2 are complete: `part_groups`, `options`, and `parts` tables exist. Part group and option CRUD endpoints work, including compound option creation.
- The existing `server/src/services/totals.ts` needs to be **reworked** to traverse the new hierarchy.
- The existing `server/src/services/exchange-rates.ts` and `server/src/routes/exchange-rates.ts` remain **unchanged**.
- Look at the Phase 2 services for patterns on how to query the new schema.

This phase has two parts:

### Part 1: Leaf entity CRUD
- Create `server/src/services/parts.ts` (new) and `server/src/routes/parts.ts` (new) for the leaf Part entity.
- Endpoints: `GET /options/:optionId/parts`, `POST /options/:optionId/parts`, `GET /parts/:partId`, `PUT /parts/:partId`, `DELETE /parts/:partId`.
- Status defaults to `'pending'` on creation. Valid statuses: `pending`, `ordered`, `owned`.
- Currency is uppercased before storage.
- Register the new router in `server/src/index.ts`.

### Part 2: Totals rework
- **`getAvailableCurrencies`**: must now JOIN `parts` → `options` → `part_groups` WHERE `project_id`. Returns currencies from ALL parts across ALL options (not just selected ones).
- **`calculateTotals`**: for each part group with a selected option, fetch the parts of that option. Convert **each part's price individually** to the target currency (parts within one option can have different currencies). Compute part group status as min(part statuses). Accumulate spent (ordered/owned) and remaining (pending) based on the computed part group status.
- The exchange rate resolution logic (`resolveRate`) does NOT need changes — it stays as direct → inverse → USD intermediary.

Critical detail: the old totals service summed one price per part. The new service must sum N prices per part group (one per part in the selected option), each potentially in a different currency.

Implement ONLY Phase 3. Follow the Definition of Done section in the spec — it includes curl scripts for parts CRUD, status propagation verification, totals with mixed currencies, and exchange rate error handling. Make sure `cd server && npx tsc --noEmit` passes.
