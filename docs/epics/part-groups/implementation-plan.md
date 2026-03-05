# Part Groups Epic — Implementation Plan

This epic refactors the data model from a flat Part → Option structure to a three-level hierarchy: Part Group → Option → Part. This enables users to compare complete configurations (e.g., a hose kit vs. a mix of individual hoses) rather than individual items.

## Context

The current model treats each Part as a single item with Options as sourcing alternatives. In practice, the user often chooses between **groups of parts** — for example, buying a complete kit from one brand vs. assembling individual parts from multiple sources. The new model makes Option a container of Parts, so the user selects a complete configuration per Part Group.

## Key Model Changes

- **Part Group** (was "Part"): a container/system with name, isOptional, sortOrder, selectedOptionId. No status column — status is computed.
- **Option** (still "Option"): now a named group of parts (e.g., "Kit Rein"). Only has a name, no price/currency/source fields.
- **Part** (new leaf entity, was "Option"): individual items with name, price, currency, source, link, comment, and status.

## Phases

| Phase | Name                              | Spec                                                                  | Description                                                                                   |
| ----- | --------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1     | Database Schema & Migration       | [01-database-schema.md](specs/01-database-schema.md)                  | New schema for part_groups, options, and parts tables. Destructive migration (data loss OK).   |
| 2     | Backend: Part Groups & Options    | [02-backend-part-groups-options.md](specs/02-backend-part-groups-options.md) | Services and routes for part groups and options, including compound option creation.           |
| 3     | Backend: Parts & Totals           | [03-backend-parts-totals.md](specs/03-backend-parts-totals.md)        | Services and routes for the new leaf Part entity. Reworked totals and currency calculations.   |
| 4     | Frontend: Types & Hooks           | [04-frontend-types-hooks.md](specs/04-frontend-types-hooks.md)        | Updated TypeScript types, API service functions, and React Query hooks for all three entities. |
| 5     | Frontend: Components & Page       | [05-frontend-components-page.md](specs/05-frontend-components-page.md)| Rewritten project detail page, parts list, options panel, and new part-level UI.               |

## Approach

- Each phase is self-contained and builds on the previous one.
- Phase 1 is destructive: existing parts and options data is dropped. Cars, projects, and exchange rates are preserved.
- Backend phases (1-3) must compile and pass before starting frontend work.
- Frontend types (Phase 4) must be complete before component work (Phase 5).
- The totals banner and exchange rates modal require no structural changes — they consume the same `/api/projects/:projectId/totals` endpoint, which is reworked internally in Phase 3.
