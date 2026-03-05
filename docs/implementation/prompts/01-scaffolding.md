I want to implement Phase 1 (Scaffolding) of this project. Read these files for full context:

- `CLAUDE.md` — project overview, conventions, and structure
- `docs/tech-spec.md` — tech stack, dev/prod setup, and tooling decisions
- `docs/implementation/specs/01-scaffolding.md` — detailed spec with Docker Compose configs, Dockerfiles, and Definition of Done

Key decisions already made:
- **Development**: only PostgreSQL runs in Docker (`docker-compose.dev.yml`). Client and server run on the host with hot reload.
- **Production**: all 3 containers via `docker-compose.yml` (Nginx + Node + Postgres).
- **Tooling**: ESLint + Prettier configured for both client and server.
- **Client dependencies to install**: React Router, React Query, shadcn/ui (initialized), Sonner, Phosphor Icons, Geist font. Most will be configured in Phase 3.
- **Design system**: read `docs/design-system.md` for colors, typography, and component patterns. The `design-taste-frontend` skill is available for frontend phases.

Implement ONLY Phase 1 — do not start any other phase. Follow the Definition of Done section in the spec to verify everything works.
