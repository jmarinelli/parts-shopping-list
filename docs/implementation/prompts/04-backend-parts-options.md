I want to implement Phase 4 (Backend: Parts & Options) of this project. Read these files for full context:

- `CLAUDE.md` — project conventions, API format, and database migration workflow
- `docs/implementation/specs/04-backend-parts-options.md` — detailed spec with schema, endpoints, business logic, and Definition of Done

Key context from previous phases:
- Phases 1-2 are complete: cars and projects tables exist, CRUD endpoints work.
- Server follows established patterns: routes/ → services/ → db/schema/.
- Response format is `{ data: ... }` / `{ error: { message: "..." } }`.

Critical business logic to implement:
- **Auto-selection**: when a part has exactly one option, it is automatically selected. This applies on option create (first option) and option delete (one remaining).
- **Reorder**: PATCH endpoint receives an array of part IDs and updates `sort_order` column accordingly.
- **Part response**: the parts list endpoint returns each part with its selected option summary (id, name, price, currency).
- **Cascade deletes**: project → parts → options.
- **FK note**: `parts.selected_option_id` FK to `options.id` with SET NULL on delete (circular reference with `options.part_id`).

Implement ONLY Phase 4 — do not start any other phase. Follow the Definition of Done section in the spec — it includes curl scripts to test CRUD, auto-selection, reorder, and cascade deletes.
