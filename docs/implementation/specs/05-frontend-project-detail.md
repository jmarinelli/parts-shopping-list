# Phase 5: Frontend — Project Detail

## Goal

Build the Project Detail page with the parts list, drag & drop reordering, inline part creation, and the options side panel.

## Prerequisites

- Phases 1-4 completed: all backend endpoints for cars, projects, parts, and options are functional.
- Phase 3 completed: React Query, toasts, modals, and breadcrumb patterns are established.

## Deliverables

### Routing

- `/cars/:carId/projects/:projectId` — Project detail page

### React Query Hooks

```typescript
// hooks/use-parts.ts
useParts(projectId)           // GET /api/projects/:projectId/parts → query
useCreatePart()               // POST → mutation, invalidates parts query
useUpdatePart()               // PUT → mutation, invalidates parts query
useDeletePart()               // DELETE → mutation, invalidates parts query
useReorderParts()             // PATCH reorder → mutation, optimistic update

// hooks/use-options.ts
useOptions(partId)            // GET /api/parts/:partId/options → query
useCreateOption()             // POST → mutation, invalidates options + parts queries
useUpdateOption()             // PUT → mutation, invalidates options + parts queries
useDeleteOption()             // DELETE → mutation, invalidates options + parts queries
useSelectOption()             // PATCH select → mutation, invalidates parts query
```

### TypeScript Types

Add to `client/src/types/index.ts`:

```typescript
export interface Part {
  id: string;
  projectId: string;
  name: string;
  status: "pending" | "ordered" | "owned";
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  selectedOption: Option | null;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: string;
  partId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Project Detail Page

#### Breadcrumb

- `Home > Car Name > Project Name`
- Each segment is clickable and navigates to the corresponding page.

#### Parts List

A table or list displaying all parts for the project, ordered by `sort_order`.

| Column            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| Drag handle       | Grip icon for drag & drop reordering (dnd-kit)                  |
| Name              | Part name                                                       |
| Status            | Dropdown to change status: `pending`, `ordered`, `owned`        |
| Optional          | Badge or icon indicating the part is optional                   |
| Selected option   | Shows selected option name + price + currency, or "Unquoted"    |
| Actions           | Delete button                                                   |

- Clicking a row (excluding the status dropdown and delete button) opens the Options Side Panel for that part.
- The currently selected part row is visually highlighted.

#### Inline Part Creation

- "Add Part" button at the bottom of the list.
- Clicking it adds a new row with an editable name field, focused and ready to type.
- Pressing Enter or clicking away saves the part via the API.
- Pressing Escape cancels the creation and removes the row.
- New parts are added at the end of the list (highest `sort_order`).

#### Drag & Drop

- Use dnd-kit to enable reordering of parts.
- On drop, call `PATCH /api/projects/:projectId/parts/reorder` with the new order.
- Optimistic UI update: reorder visually before the API responds, revert on error.

### Options Side Panel

- Slides in from the right when a part is selected.
- Can be closed with a close button or by pressing Escape.
- Width: approximately 400-450px.

#### Panel Header

- Part name (editable inline — click to edit, Enter to save).
- Status dropdown.
- Optional toggle/checkbox.

#### Options List

- Each option displayed as a card with:
  - Radio button to select/deselect as the chosen option.
  - Name/brand.
  - Price + currency.
  - Source.
  - Link (clickable, opens in new tab).
  - Comment.
  - Edit and delete action buttons.
- The currently selected option is visually highlighted.
- Auto-selection indicator: if there is only one option, show it as selected with a note like "Auto-selected (only option)".

#### Add Option

- "Add Option" button at the bottom of the panel.
- Opens an inline form or modal with fields: name, price, currency, source, link, comment.
- Name, price, and currency are required; source, link, and comment are optional.

#### Edit Option

- Clicking edit on an option opens the same form pre-filled with the option's data.

#### Delete Option

- Confirm delete dialog before removing an option.
- After deletion, handle auto-selection logic (reflected from the API response, React Query re-fetches).

### Client Structure (additions)

```
client/src/
├── components/
│   ├── parts-list.tsx
│   ├── part-row.tsx
│   ├── options-panel.tsx
│   ├── option-card.tsx
│   └── option-form.tsx
├── hooks/
│   ├── use-parts.ts
│   └── use-options.ts
├── pages/
│   └── project-detail.tsx
```

## Definition of Done

### Visual verification (in browser)

```
Prerequisites: have a car and project created from Phase 3.

1. Navigate to a project → Project Detail page loads.
   → Breadcrumb shows "Home > Car Name > Project Name".
   → Empty state: "No parts yet. Add your first part!"

2. Click "Add Part" → inline editable row appears at bottom.
   Type "Radiator", press Enter.
   → Part row appears with status "pending", "Unquoted", success toast.

3. Add 3 more parts: "Water Pump", "Thermostat", "Upper Hose".
   → All 4 parts visible in order.

4. Drag "Thermostat" above "Radiator" using the drag handle.
   → List reorders immediately (optimistic). Order persists after page refresh.

5. Click the "Radiator" row → side panel slides in from right.
   → Panel shows part name, status dropdown, optional toggle.
   → "No options yet" message.

6. Click "Add Option" → form appears.
   Fill: name="Mishimoto", price=250, currency=USD, source="FCP Euro", link="https://example.com", comment="Aluminum".
   Save.
   → Option card appears, auto-selected (radio filled, "Auto-selected" note).
   → Parts list updates: Radiator row shows "Mishimoto - $250.00 USD".

7. Add second option: name="OEM BMW", price=180, currency=USD.
   → Two option cards visible. First one still selected.

8. Click radio on "OEM BMW" → it becomes selected.
   → Parts list updates: "OEM BMW - $180.00 USD".

9. Click edit on "OEM BMW" → form pre-filled. Change price to 195. Save.
   → Card and parts list update.

10. Click delete on "OEM BMW" → confirm dialog. Confirm.
    → Only "Mishimoto" remains, auto-selected.

11. Change status dropdown on a part row to "ordered".
    → Status updates, success toast.

12. Close side panel with X button or Escape.
    → Panel slides out. No part row highlighted.

13. Delete a part from the list → confirm dialog → removed.
```

### Keyboard interaction

```
- Escape closes the side panel.
- Escape cancels inline part creation.
- Enter submits inline part creation.
- Enter submits option form.
```

## Acceptance Criteria

- [ ] Project detail page displays parts ordered by `sort_order`.
- [ ] Parts show name, status, optional flag, and selected option summary.
- [ ] User can add a part inline at the bottom of the list.
- [ ] User can delete a part with confirmation.
- [ ] Drag & drop reorders parts with optimistic UI, persists via API.
- [ ] Clicking a part opens the side panel with its options.
- [ ] Side panel shows all option details and allows selecting one via radio button.
- [ ] User can add, edit, and delete options from the side panel.
- [ ] Auto-selection works: single option is automatically selected (reflected from API).
- [ ] Part name, status, and optional flag are editable from the side panel.
- [ ] Breadcrumb navigation works across all three levels.
- [ ] Side panel can be closed with X button or Escape key.
- [ ] React Query hooks with proper cache invalidation for parts and options.
- [ ] Optimistic update on drag & drop with rollback on error.
- [ ] Loading and empty states for parts list and options list.
- [ ] Error and success toasts on all mutations.
