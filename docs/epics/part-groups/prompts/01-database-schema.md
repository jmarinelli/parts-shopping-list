I want to implement Phase 1 (Database Schema & Migration) of the Part Groups epic. Read these files for full context:

- `CLAUDE.md` — project conventions, database migration workflow, and project structure
- `docs/epics/part-groups/implementation-plan.md` — overview of the full epic
- `docs/epics/part-groups/specs/01-database-schema.md` — detailed spec with table definitions, Drizzle schema code, and Definition of Done

Key context:
- The project already has `cars`, `projects`, `parts`, `options`, and `exchange_rates` tables from previous implementation phases.
- The old `parts` and `options` tables must be **dropped and replaced**. All existing parts/options data will be lost. Cars, projects, and exchange rates must be preserved.
- Server follows established patterns in `server/src/db/schema/` using Drizzle ORM with `drizzle-orm/pg-core`.

Critical details:
- **Three new tables**: `part_groups` (replaces old `parts`), `options` (simplified — loses price/currency/source/link/comment), and `parts` (new leaf entity — gets the fields that options used to have, plus status).
- **Circular FK**: `part_groups.selected_option_id` → `options.id` (SET NULL) and `options.part_group_id` → `part_groups.id` (CASCADE). Use the `AnyPgColumn` lazy reference pattern already established in the codebase.
- **Cascade chain**: projects → part_groups → options → parts.
- Delete the old `server/src/db/schema/parts.ts` file and create `server/src/db/schema/part-groups.ts` in its place. Rewrite `options.ts` and create the new `parts.ts`.

After modifying schema files, generate and apply the migration:
```bash
cd server && npx drizzle-kit generate
cd server && npx drizzle-kit migrate
```

If Drizzle Kit cannot generate a clean migration, write the SQL manually (the spec includes reference SQL).

**Important**: After this phase, services and routes that reference the old schema will have TypeScript errors — that is expected and will be fixed in Phase 2. The goal here is only the schema files and migration.

Implement ONLY Phase 1 — do not modify services, routes, or frontend code. Follow the Definition of Done section in the spec to verify the tables, columns, and foreign key constraints.
