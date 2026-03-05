# Phase 2: Backend — Cars & Projects

## Goal

Implement the database schema, migrations, and CRUD API endpoints for cars and projects.

## Prerequisites

- Phase 1 completed: database running in Docker, server running on host with hot reload.

## Deliverables

### Database Schema

#### `cars` table

| Column       | Type         | Constraints              |
| ------------ | ------------ | ------------------------ |
| `id`         | UUID         | Primary key, default gen |
| `name`       | VARCHAR(255) | Not null                 |
| `created_at` | TIMESTAMP    | Not null, default now    |
| `updated_at` | TIMESTAMP    | Not null, default now    |

#### `projects` table

| Column       | Type         | Constraints                    |
| ------------ | ------------ | ------------------------------ |
| `id`         | UUID         | Primary key, default gen       |
| `car_id`     | UUID         | Not null, FK → cars.id, cascade delete |
| `name`       | VARCHAR(255) | Not null                       |
| `created_at` | TIMESTAMP    | Not null, default now          |
| `updated_at` | TIMESTAMP    | Not null, default now          |

### API Endpoints

#### Cars

| Method | Endpoint          | Description       | Request Body        | Response              |
| ------ | ----------------- | ----------------- | ------------------- | --------------------- |
| GET    | `/api/cars`       | List all cars     | —                   | `{ data: Car[] }`     |
| POST   | `/api/cars`       | Create a car      | `{ name }`          | `{ data: Car }`       |
| GET    | `/api/cars/:carId`   | Get a car         | —                   | `{ data: Car }`       |
| PUT    | `/api/cars/:carId`   | Update a car      | `{ name }`          | `{ data: Car }`       |
| DELETE | `/api/cars/:carId`   | Delete a car      | —                   | `{ data: { id } }`    |

#### Projects

| Method | Endpoint                          | Description              | Request Body | Response                |
| ------ | --------------------------------- | ------------------------ | ------------ | ----------------------- |
| GET    | `/api/cars/:carId/projects`       | List projects for a car  | —            | `{ data: Project[] }`   |
| POST   | `/api/cars/:carId/projects`       | Create a project         | `{ name }`   | `{ data: Project }`     |
| GET    | `/api/projects/:projectId`        | Get a project            | —            | `{ data: Project }`     |
| PUT    | `/api/projects/:projectId`        | Update a project         | `{ name }`   | `{ data: Project }`     |
| DELETE | `/api/projects/:projectId`        | Delete a project         | —            | `{ data: { id } }`      |

### Server Structure

```
server/src/
├── db/
│   ├── schema/
│   │   ├── cars.ts
│   │   └── projects.ts
│   ├── index.ts          # Drizzle client instance
│   └── migrate.ts        # Migration runner
├── routes/
│   ├── cars.ts
│   └── projects.ts
├── services/
│   ├── cars.ts
│   └── projects.ts
└── app.ts
```

### Validation

- `name` is required and must be a non-empty string on create and update.
- Return `404` when a referenced car or project does not exist.
- Return `400` for invalid input with a descriptive error message.

## Definition of Done

### Database

```bash
# Generate and apply migration
cd server && npx drizzle-kit generate
cd server && npx drizzle-kit migrate

# Verify tables exist
docker exec -it <db-container> psql -U postgres -d shopping_lists -c "\dt"
# → Should list: cars, projects
```

### Cars CRUD

```bash
# Create a car
curl -s -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -d '{"name": "BMW E36 328i"}' | jq
# → { "data": { "id": "...", "name": "BMW E36 328i", ... } }

# List all cars
curl -s http://localhost:3001/api/cars | jq
# → { "data": [ { "id": "...", "name": "BMW E36 328i", ... } ] }

# Get a single car (use id from create response)
curl -s http://localhost:3001/api/cars/<car-id> | jq
# → { "data": { "id": "...", "name": "BMW E36 328i", ... } }

# Update a car
curl -s -X PUT http://localhost:3001/api/cars/<car-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "BMW E36 325i"}' | jq
# → { "data": { "id": "...", "name": "BMW E36 325i", ... } }

# Delete a car
curl -s -X DELETE http://localhost:3001/api/cars/<car-id> | jq
# → { "data": { "id": "..." } }
```

### Projects CRUD

```bash
# Create a project (use a valid car-id)
curl -s -X POST http://localhost:3001/api/cars/<car-id>/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Cooling System Overhaul"}' | jq
# → { "data": { "id": "...", "carId": "...", "name": "Cooling System Overhaul", ... } }

# List projects for a car
curl -s http://localhost:3001/api/cars/<car-id>/projects | jq
# → { "data": [ ... ] }

# Update a project
curl -s -X PUT http://localhost:3001/api/projects/<project-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Cooling System Refresh"}' | jq

# Delete a project
curl -s -X DELETE http://localhost:3001/api/projects/<project-id> | jq
```

### Error Handling

```bash
# Invalid input (empty name)
curl -s -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -d '{"name": ""}' | jq
# → HTTP 400, { "error": { "message": "..." } }

# Non-existent resource
curl -s http://localhost:3001/api/cars/00000000-0000-0000-0000-000000000000 | jq
# → HTTP 404, { "error": { "message": "..." } }

# Cascade delete: create a car with projects, delete the car, verify projects are gone
```

## Acceptance Criteria

- [ ] Drizzle migration creates `cars` and `projects` tables.
- [ ] All car CRUD endpoints work and return the correct response format.
- [ ] All project CRUD endpoints work and return the correct response format.
- [ ] Deleting a car cascades to its projects.
- [ ] Invalid input returns `400` with an error message.
- [ ] Non-existent resources return `404`.
- [ ] Response format matches the standard: `{ data: ... }` or `{ error: { message: ... } }`.
