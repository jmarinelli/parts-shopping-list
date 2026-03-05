I want to implement Phase 5 (Frontend: Project Detail) of this project. Read these files for full context:

- `CLAUDE.md` — project conventions and structure
- `docs/tech-spec.md` — shared TypeScript types for Part and Option
- `docs/ui-spec.md` — UI patterns (side panel, parts list, option cards)
- `docs/design-system.md` — colors, typography, component styles, and visual patterns
- `docs/implementation/specs/05-frontend-project-detail.md` — detailed spec with React Query hooks, component structure, and Definition of Done

Key context from previous phases:
- Phases 1-4 are complete: all backend endpoints work (cars, projects, parts, options, reorder, select).
- Phase 3 established frontend patterns: React Query hooks, toast notifications, reusable modal/button/breadcrumb components, API client.
- Follow the same patterns for parts and options hooks. Including `design-taste-frontend` skill (DESIGN_VARIANCE=3, MOTION_INTENSITY=4, VISUAL_DENSITY=4)

Key decisions already made:
- **Drag & drop**: use dnd-kit. Optimistic UI on reorder (update visually, revert on error).
- **Side panel**: slides in from the right (~400-450px) when a part row is clicked. Escape to close.
- **Inline part creation**: "Add Part" adds an editable row, Enter saves, Escape cancels.
- **Option form**: name, price, currency are required. Source, link, comment are optional.
- **Auto-selection**: reflected from API response. If API returns a part with auto-selected option, UI shows it.
- **Types**: add `Part` and `Option` interfaces to `types/index.ts` (see tech-spec.md for shapes).

This is the most complex frontend phase. Take it component by component:
1. First build the page shell with breadcrumb and empty parts list.
2. Then add inline part creation and the parts table.
3. Then add drag & drop.
4. Then build the side panel with options.
5. Finally wire up option CRUD and selection.

Implement ONLY Phase 5 — do not start any other phase. Follow the Definition of Done section in the spec — it includes a detailed step-by-step visual verification and keyboard interaction checklist.
