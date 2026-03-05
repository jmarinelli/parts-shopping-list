I want to implement Phase 2 (Backend: Cars & Projects) of this project. Read these files for full context:

- `CLAUDE.md` — project conventions, API format, and database migration workflow
- `docs/implementation/specs/02-backend-cars-projects.md` — detailed spec with schema, endpoints, and Definition of Done

Key context from previous phases:
- Phase 1 is complete: PostgreSQL is running in Docker, Express server with health check is running on the host.
- Drizzle ORM is already configured and connected to the database.
- Server structure follows: routes/ (HTTP handling), services/ (business logic), db/schema/ (Drizzle schema).

Key conventions:
- Response format: `{ data: ... }` for success, `{ error: { message: "..." } }` for errors.
- Database columns use snake_case, API response fields use camelCase.
- UUIDs for all primary keys.

Implement ONLY Phase 2 — do not start any other phase. Follow the Definition of Done section in the spec — it includes curl commands to verify every endpoint.
