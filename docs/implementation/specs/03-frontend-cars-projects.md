# Phase 3: Frontend — Cars & Projects

## Goal

Build the Home page (car list) and Car Detail page (project list) with full CRUD functionality, establishing the frontend patterns (React Query, toasts, modals) that will be reused in later phases.

## Prerequisites

- Phase 1-2 completed: server running with cars and projects CRUD endpoints.

## Deliverables

### Routing

- `/` — Home page (car list)
- `/cars/:carId` — Car detail page (project list)

Use React Router for client-side routing.

### API Client

Set up a base API client in `client/src/services/api.ts`:

- Base URL derived from Vite proxy (just `/api`).
- Wrapper around `fetch` that:
  - Sets `Content-Type: application/json`.
  - Parses JSON responses.
  - Throws errors for non-2xx responses with the error message from the API.

### React Query Setup

- Configure `QueryClient` in `main.tsx` with `QueryClientProvider`.
- Custom hooks in `client/src/hooks/`:

```typescript
// hooks/use-cars.ts
useCars()              // GET /api/cars → query
useCreateCar()         // POST /api/cars → mutation, invalidates cars query
useUpdateCar()         // PUT /api/cars/:id → mutation, invalidates cars query
useDeleteCar()         // DELETE /api/cars/:id → mutation, invalidates cars query

// hooks/use-projects.ts
useProjects(carId)     // GET /api/cars/:carId/projects → query
useCreateProject()     // POST → mutation, invalidates projects query
useUpdateProject()     // PUT → mutation, invalidates projects query
useDeleteProject()     // DELETE → mutation, invalidates projects query
```

- Mutations show success/error toasts via Sonner.

### Toast Setup

- Configure `<Toaster />` from Sonner in `App.tsx`.
- Success toasts on create/update/delete.
- Error toasts on any API failure (message from API response).

### Home Page (Car List)

- Displays all cars as cards in a grid or list layout.
- Each card shows the car name.
- Each card has edit (pencil icon) and delete (trash icon) action buttons.
- "Add Car" button in the header or as an empty-state call to action.
- Clicking a car card navigates to `/cars/:carId`.
- Loading state: skeleton or spinner while fetching.
- Empty state: message like "No cars yet. Add your first car!" with the add button.

### Car Detail Page (Project List)

- Breadcrumb: `Home > Car Name`.
- Displays the car name as a heading.
- Lists all projects for the car.
- Each project row/card shows the project name.
- Each project has edit and delete action buttons.
- "Add Project" button.
- Clicking a project navigates to `/cars/:carId/projects/:projectId` (page built in Phase 5).
- Loading and empty states.

### Modals

#### Create/Edit Car Modal

- Single field: name.
- "Save" and "Cancel" buttons.
- Used for both create and edit (pre-filled when editing).
- Submit on Enter key.

#### Create/Edit Project Modal

- Single field: name.
- "Save" and "Cancel" buttons.
- Submit on Enter key.

#### Confirm Delete Modal

- Message: "Are you sure you want to delete {name}? This action cannot be undone."
- For cars: warn that all projects and their parts will also be deleted.
- "Delete" (destructive red style) and "Cancel" buttons.

### Reusable UI Components

Build these in `client/src/components/ui/`:

- `modal.tsx` — generic modal wrapper (backdrop, close on Escape, close on backdrop click).
- `button.tsx` — styled button with variants (primary, destructive, ghost).
- `breadcrumb.tsx` — breadcrumb navigation component.

### Client Structure

```
client/src/
├── components/
│   ├── ui/
│   │   ├── modal.tsx
│   │   ├── button.tsx
│   │   └── breadcrumb.tsx
│   ├── car-card.tsx
│   └── project-card.tsx
├── hooks/
│   ├── use-cars.ts
│   └── use-projects.ts
├── pages/
│   ├── home.tsx
│   └── car-detail.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### TypeScript Types

Define in `client/src/types/index.ts`:

```typescript
export interface Car {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  carId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

## Definition of Done

### Visual verification (in browser)

```
1. Open http://localhost:5173
   → Home page loads, shows "No cars yet" or existing cars.

2. Click "Add Car" → modal opens.
   Type "BMW E36 328i", press Enter or click Save.
   → Modal closes, car card appears, success toast shown.

3. Click the edit icon on the car card → modal opens pre-filled.
   Change name to "BMW E36 325i", save.
   → Card updates, success toast shown.

4. Click the car card → navigates to /cars/:carId.
   → Breadcrumb shows "Home > BMW E36 325i".
   → Project list is empty with "No projects yet" message.

5. Click "Add Project" → modal opens.
   Type "Cooling System Overhaul", save.
   → Project appears in list.

6. Click the delete icon on the project → confirm dialog appears.
   Click "Delete".
   → Project removed, success toast shown.

7. Navigate back via breadcrumb "Home" → returns to car list.

8. Delete the car → confirm dialog warns about cascading delete.
   Confirm → car removed.
```

### Error handling verification

```
1. Stop the server (Ctrl+C in server terminal).
2. Refresh the page → should show loading state, then error toast.
3. Try to create a car → should show error toast.
4. Restart the server → refresh page → should load normally.
```

## Acceptance Criteria

- [ ] Home page lists all cars fetched from the API via React Query.
- [ ] User can create a new car via modal.
- [ ] User can edit a car name via modal.
- [ ] User can delete a car with confirmation dialog (warns about cascade).
- [ ] Car detail page shows the car name and lists its projects.
- [ ] User can create, edit, and delete projects.
- [ ] Breadcrumb navigation works (Home > Car Name).
- [ ] Clicking a car navigates to its detail page.
- [ ] Loading states shown while fetching data.
- [ ] Empty states shown when no cars/projects exist.
- [ ] Error toasts shown on API failures.
- [ ] Success toasts shown on create/update/delete.
- [ ] Modals close on Escape, backdrop click, or Cancel button.
- [ ] React Query hooks properly invalidate caches after mutations.
- [ ] Reusable modal, button, and breadcrumb UI components created.
