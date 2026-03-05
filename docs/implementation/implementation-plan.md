# Implementation Plan

The project is built incrementally in 6 phases. Each phase is self-contained: it is developed, tested, and validated before moving to the next.

## Phases

| Phase | Name                        | Spec                                                  | Description                                                              |
| ----- | --------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| 1     | Scaffolding                 | [01-scaffolding.md](specs/01-scaffolding.md)           | Docker Compose setup, base client/server projects, database connection   |
| 2     | Backend: Cars & Projects    | [02-backend-cars-projects.md](specs/02-backend-cars-projects.md) | Database schema, migrations, and CRUD endpoints for cars and projects    |
| 3     | Frontend: Cars & Projects   | [03-frontend-cars-projects.md](specs/03-frontend-cars-projects.md) | Home page (car list) and car detail page (project list)                  |
| 4     | Backend: Parts & Options    | [04-backend-parts-options.md](specs/04-backend-parts-options.md) | Database schema, migrations, and endpoints for parts, options, and reordering |
| 5     | Frontend: Project Detail    | [05-frontend-project-detail.md](specs/05-frontend-project-detail.md) | Parts list with drag & drop, options side panel, inline part creation    |
| 6     | Totals & Exchange Rates     | [06-totals-exchange-rates.md](specs/06-totals-exchange-rates.md) | Project totals calculation, currency conversion, exchange rate config    |

## Approach

- Each phase produces a working, testable increment.
- Backend phases include database schema, migrations, and fully functional API endpoints.
- Frontend phases consume the API built in previous phases.
- Phase 6 ties everything together with the totals and currency logic.
