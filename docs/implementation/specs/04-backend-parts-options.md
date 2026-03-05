# Phase 4: Backend — Parts & Options

## Goal

Implement the database schema, migrations, and API endpoints for parts, options, part reordering, and option selection.

## Prerequisites

- Phase 1-2 completed: server running, cars and projects tables and endpoints exist.

## Deliverables

### Database Schema

#### `parts` table

| Column            | Type         | Constraints                           |
| ----------------- | ------------ | ------------------------------------- |
| `id`              | UUID         | Primary key, default gen              |
| `project_id`      | UUID         | Not null, FK → projects.id, cascade delete |
| `name`            | VARCHAR(255) | Not null                              |
| `status`          | VARCHAR(20)  | Not null, default `'pending'`. Enum: `pending`, `ordered`, `owned` |
| `is_optional`     | BOOLEAN      | Not null, default `false`             |
| `sort_order`      | INTEGER      | Not null                              |
| `selected_option_id` | UUID      | Nullable, FK → options.id, set null on delete |
| `created_at`      | TIMESTAMP    | Not null, default now                 |
| `updated_at`      | TIMESTAMP    | Not null, default now                 |

#### `options` table

| Column       | Type           | Constraints                          |
| ------------ | -------------- | ------------------------------------ |
| `id`         | UUID           | Primary key, default gen             |
| `part_id`    | UUID           | Not null, FK → parts.id, cascade delete |
| `name`       | VARCHAR(255)   | Not null                             |
| `price`      | DECIMAL(12,2)  | Not null                             |
| `currency`   | VARCHAR(10)    | Not null                             |
| `source`     | VARCHAR(255)   | Nullable                             |
| `link`       | TEXT           | Nullable                             |
| `comment`    | TEXT           | Nullable                             |
| `created_at` | TIMESTAMP      | Not null, default now                |
| `updated_at` | TIMESTAMP      | Not null, default now                |

### API Endpoints

#### Parts

| Method | Endpoint                                  | Description                | Request Body                                      | Response              |
| ------ | ----------------------------------------- | -------------------------- | ------------------------------------------------- | --------------------- |
| GET    | `/api/projects/:projectId/parts`          | List parts for a project   | —                                                 | `{ data: Part[] }`    |
| POST   | `/api/projects/:projectId/parts`          | Create a part              | `{ name, status?, isOptional? }`                  | `{ data: Part }`      |
| GET    | `/api/parts/:partId`                      | Get a part with its options| —                                                 | `{ data: Part }`      |
| PUT    | `/api/parts/:partId`                      | Update a part              | `{ name?, status?, isOptional? }`                 | `{ data: Part }`      |
| DELETE | `/api/parts/:partId`                      | Delete a part              | —                                                 | `{ data: { id } }`    |
| PATCH  | `/api/projects/:projectId/parts/reorder`  | Reorder parts              | `{ orderedIds: string[] }`                        | `{ data: Part[] }`    |

#### Options

| Method | Endpoint                                       | Description              | Request Body                                          | Response               |
| ------ | ---------------------------------------------- | ------------------------ | ----------------------------------------------------- | ---------------------- |
| GET    | `/api/parts/:partId/options`                   | List options for a part  | —                                                     | `{ data: Option[] }`   |
| POST   | `/api/parts/:partId/options`                   | Create an option         | `{ name, price, currency, source?, link?, comment? }` | `{ data: Option }`     |
| GET    | `/api/options/:optionId`                       | Get an option            | —                                                     | `{ data: Option }`     |
| PUT    | `/api/options/:optionId`                       | Update an option         | `{ name?, price?, currency?, source?, link?, comment? }` | `{ data: Option }`  |
| DELETE | `/api/options/:optionId`                       | Delete an option         | —                                                     | `{ data: { id } }`    |
| PATCH  | `/api/parts/:partId/options/:optionId/select`  | Select an option         | —                                                     | `{ data: Part }`       |

### Business Logic

#### Auto-Selection

- When a new option is created and it is the only option for the part, it is automatically selected (`selected_option_id` is set).
- When an option is deleted and the part has exactly one remaining option, that option is automatically selected.
- When an option is deleted and it was the selected option, `selected_option_id` is set to `null` (unless auto-selection kicks in per the rule above).

#### Reorder

- `PATCH /api/projects/:projectId/parts/reorder` receives an array of part IDs in the desired order.
- The `sort_order` column is updated for each part accordingly.

#### Part Response

- The `GET /api/parts/:id` endpoint returns the part with its options array and the selected option populated.
- The `GET /api/projects/:projectId/parts` endpoint returns parts ordered by `sort_order`, each including its selected option summary (id, name, price, currency).

### Server Structure (additions)

```
server/src/
├── db/schema/
│   ├── parts.ts
│   └── options.ts
├── routes/
│   ├── parts.ts
│   └── options.ts
├── services/
│   ├── parts.ts
│   └── options.ts
```

## Definition of Done

### Database

```bash
cd server && npx drizzle-kit generate
cd server && npx drizzle-kit migrate

docker exec -it <db-container> psql -U postgres -d shopping_lists -c "\dt"
# → Should list: cars, projects, parts, options
```

### Parts CRUD

```bash
# Prerequisite: create a car and project first
CAR_ID=$(curl -s -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -d '{"name":"BMW E36"}' | jq -r '.data.id')

PROJECT_ID=$(curl -s -X POST http://localhost:3001/api/cars/$CAR_ID/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Cooling System"}' | jq -r '.data.id')

# Create a part
curl -s -X POST http://localhost:3001/api/projects/$PROJECT_ID/parts \
  -H "Content-Type: application/json" \
  -d '{"name": "Radiator"}' | jq
# → { "data": { "id": "...", "name": "Radiator", "status": "pending", "isOptional": false, "sortOrder": 0, ... } }

# List parts (ordered by sort_order)
curl -s http://localhost:3001/api/projects/$PROJECT_ID/parts | jq

# Update a part
curl -s -X PUT http://localhost:3001/api/parts/<part-id> \
  -H "Content-Type: application/json" \
  -d '{"status": "ordered", "isOptional": true}' | jq
```

### Options CRUD + Auto-Selection

```bash
# Create first option (should auto-select)
OPTION_1=$(curl -s -X POST http://localhost:3001/api/parts/<part-id>/options \
  -H "Content-Type: application/json" \
  -d '{"name":"Mishimoto","price":250.00,"currency":"USD","source":"FCP Euro","link":"https://example.com","comment":"Aluminum"}' | jq -r '.data.id')

# Verify auto-selection
curl -s http://localhost:3001/api/parts/<part-id> | jq '.data.selectedOptionId'
# → Should be $OPTION_1

# Create second option (selection should NOT change)
OPTION_2=$(curl -s -X POST http://localhost:3001/api/parts/<part-id>/options \
  -H "Content-Type: application/json" \
  -d '{"name":"OEM BMW","price":180.00,"currency":"USD","source":"ECS Tuning"}' | jq -r '.data.id')

curl -s http://localhost:3001/api/parts/<part-id> | jq '.data.selectedOptionId'
# → Should still be $OPTION_1

# Select the second option
curl -s -X PATCH http://localhost:3001/api/parts/<part-id>/options/$OPTION_2/select | jq
# → Part with selectedOptionId = $OPTION_2

# Delete selected option, only one remains → auto-select
curl -s -X DELETE http://localhost:3001/api/options/$OPTION_2 | jq
curl -s http://localhost:3001/api/parts/<part-id> | jq '.data.selectedOptionId'
# → Should be $OPTION_1 (auto-selected, only remaining)
```

### Reorder

```bash
# Create 3 parts, then reorder
curl -s -X PATCH http://localhost:3001/api/projects/$PROJECT_ID/parts/reorder \
  -H "Content-Type: application/json" \
  -d '{"orderedIds": ["<part-3-id>", "<part-1-id>", "<part-2-id>"]}' | jq

# Verify order
curl -s http://localhost:3001/api/projects/$PROJECT_ID/parts | jq '[ .data[].name ]'
# → Should reflect the new order
```

### Cascade Delete

```bash
# Delete the project → verify parts and options are gone
curl -s -X DELETE http://localhost:3001/api/projects/$PROJECT_ID | jq
# Trying to get a part should 404
curl -s http://localhost:3001/api/parts/<part-id> | jq
# → HTTP 404
```

## Acceptance Criteria

- [ ] Drizzle migration creates `parts` and `options` tables.
- [ ] All part CRUD endpoints work correctly.
- [ ] All option CRUD endpoints work correctly.
- [ ] Part reorder endpoint updates `sort_order` for all affected parts.
- [ ] When a part has only one option, it is automatically selected.
- [ ] When the selected option is deleted and one option remains, it is auto-selected.
- [ ] Selecting an option updates `selected_option_id` on the part.
- [ ] A part can only have one selected option at a time.
- [ ] Deleting a project cascades to its parts and their options.
- [ ] Parts list is returned ordered by `sort_order`.
- [ ] Response format matches the standard: `{ data: ... }` or `{ error: { message: ... } }`.
