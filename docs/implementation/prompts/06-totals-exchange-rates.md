I want to implement Phase 6 (Totals & Exchange Rates) of this project. This is the final phase. Read these files for full context:

- `CLAUDE.md` — project conventions and structure
- `docs/project-spec.md` — business rules for totals, currencies, and exchange rates
- `docs/tech-spec.md` — shared TypeScript types for ExchangeRate and ProjectTotals
- `docs/ui-spec.md` — totals banner and exchange rates modal UI patterns
- `docs/design-system.md` — colors, typography, component styles, and visual patterns
- `docs/implementation/specs/06-totals-exchange-rates.md` — detailed spec with schema, endpoints, calculation logic, and Definition of Done

Key context from previous phases:
- Phases 1-5 are complete: full CRUD and UI for cars, projects, parts, and options.
- Frontend patterns established: React Query hooks, toast notifications, modals, API client. Including `design-taste-frontend` skill (DESIGN_VARIANCE=3, MOTION_INTENSITY=4, VISUAL_DENSITY=4)

Key business logic:
- **Totals**: sum of selected option prices, split into spent (ordered+owned) and remaining (pending).
- **Currency conversion**: manual exchange rates per project. Support direct and inverse rate lookup.
- **Available currencies**: derived from distinct currencies in the project's options.
- **Include optionals toggle**: when off, optional parts are excluded from totals.
- **Missing rate error**: if conversion is needed but no rate exists, return an error specifying which pair is missing.

Key UI:
- **Totals banner**: sticky, positioned between breadcrumb and parts list. Shows Total/Spent/Remaining + currency selector + optionals toggle.
- **Exchange rates modal**: opened from gear icon in project header. Lists currency pairs with rate inputs.
- **Warning**: if rate is missing, banner shows warning with link to open exchange rates modal.

Implement ONLY Phase 6. Follow the Definition of Done section in the spec — it includes backend curl commands and a step-by-step visual verification checklist.
