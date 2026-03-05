# Phase 2: Backend — Part Groups & Options

## Goal

Implement services and routes for part groups and options, including compound option creation (option + first part in a single request).

## Prerequisites

- Phase 1 completed: `part_groups`, `options`, and `parts` tables exist in the database.

## Deliverables

### API Endpoints

#### Part Groups

| Method | Endpoint                                            | Description                     | Request Body                  | Response                  |
| ------ | --------------------------------------------------- | ------------------------------- | ----------------------------- | ------------------------- |
| GET    | `/api/projects/:projectId/part-groups`              | List part groups for a project  | —                             | `{ data: PartGroup[] }`  |
| POST   | `/api/projects/:projectId/part-groups`              | Create a part group             | `{ name, isOptional? }`       | `{ data: PartGroup }`    |
| GET    | `/api/part-groups/:partGroupId`                     | Get a part group with options   | —                             | `{ data: PartGroup }`    |
| PUT    | `/api/part-groups/:partGroupId`                     | Update a part group             | `{ name?, isOptional? }`      | `{ data: PartGroup }`    |
| DELETE | `/api/part-groups/:partGroupId`                     | Delete a part group             | —                             | `{ data: { id } }`       |
| PATCH  | `/api/projects/:projectId/part-groups/reorder`      | Reorder part groups             | `{ orderedIds: string[] }`    | `{ data: PartGroup[] }`  |

#### Options

| Method | Endpoint                                                       | Description              | Request Body                                                    | Response                 |
| ------ | -------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------- | ------------------------ |
| GET    | `/api/part-groups/:partGroupId/options`                        | List options (with parts)| —                                                               | `{ data: Option[] }`     |
| POST   | `/api/part-groups/:partGroupId/options`                        | Create option + 1st part | `{ name, firstPart: { name, price, currency, source?, link?, comment? } }` | `{ data: Option }` |
| GET    | `/api/options/:optionId`                                       | Get an option with parts | —                                                               | `{ data: Option }`       |
| PUT    | `/api/options/:optionId`                                       | Update option name       | `{ name? }`                                                     | `{ data: Option }`       |
| DELETE | `/api/options/:optionId`                                       | Delete an option         | —                                                               | `{ data: { id } }`       |
| PATCH  | `/api/part-groups/:partGroupId/options/:optionId/select`       | Select an option         | —                                                               | `{ data: PartGroup }`    |

### Response Shapes

#### PartGroup (list endpoint)

The `GET /api/projects/:projectId/part-groups` response includes computed fields for each part group:

```typescript
interface PartGroupListItem {
  id: string;
  projectId: string;
  name: string;
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  // Computed from parts of the selected option:
  computedStatus: 'pending' | 'ordered' | 'owned' | null;
  selectedOption: {
    id: string;
    name: string;
    computedPrice: number | null;
    currencies: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}
```

**computedStatus logic:**
- If no selected option or selected option has no parts → `null`
- Otherwise: the minimum status among the selected option's parts
- Status ordering: `pending` < `ordered` < `owned`
- Example: 3 parts with statuses `[owned, ordered, pending]` → `pending`

**computedPrice logic:**
- Sum of all parts' prices in the selected option
- If parts have mixed currencies, `computedPrice` is `null` and `currencies` lists all distinct currencies

#### Option (with embedded parts)

```typescript
interface OptionResponse {
  id: string;
  partGroupId: string;
  name: string;
  parts: PartResponse[];
  createdAt: string;
  updatedAt: string;
}

interface PartResponse {
  id: string;
  optionId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  status: 'pending' | 'ordered' | 'owned';
  createdAt: string;
  updatedAt: string;
}
```

### Business Logic

#### Auto-Selection

Same rules as before, applied to part groups:

- When a new option is created and it is the **only** option for the part group, it is automatically selected (`selected_option_id` is set).
- When an option is deleted and the part group has exactly **one remaining** option, that option is automatically selected.
- When the selected option is deleted, `selected_option_id` is set to `null` (unless auto-selection kicks in per the rule above).

#### Compound Option Creation

Creating an option via `POST /api/part-groups/:partGroupId/options` is an atomic operation:

1. Insert the option record (name only)
2. Insert the first part record (with all part fields)
3. Handle auto-selection (if this is the only option)
4. Return the option with its parts array

This must happen in a **database transaction** — if the part insert fails, the option insert is rolled back.

#### Reorder

Identical to the previous implementation, but on `part_groups` table:
- Receives `{ orderedIds: string[] }` — array of part group IDs in desired order
- Updates `sort_order` for each part group

### Server Structure

```
server/src/
├── db/schema/
│   ├── part-groups.ts          # from Phase 1
│   ├── options.ts              # from Phase 1
│   └── parts.ts                # from Phase 1
├── routes/
│   ├── part-groups.ts          # NEW (replaces old parts.ts)
│   └── options.ts              # REWRITTEN
├── services/
│   ├── part-groups.ts          # NEW (replaces old parts.ts)
│   └── options.ts              # REWRITTEN
└── index.ts                    # updated router imports
```

#### Files to delete

- `server/src/routes/parts.ts` (old) — replaced by `part-groups.ts`
- `server/src/services/parts.ts` (old) — replaced by `part-groups.ts`

Note: new `routes/parts.ts` and `services/parts.ts` for the leaf entity are created in Phase 3.

#### `server/src/index.ts` changes

Replace the old parts router import with the new part-groups router:

```typescript
import { partGroupsRouter } from './routes/part-groups';
import { optionsRouter } from './routes/options';
// parts router added in Phase 3

app.use('/api', partGroupsRouter);
app.use('/api', optionsRouter);
```

### Service Functions

#### `server/src/services/part-groups.ts`

```typescript
listPartGroupsByProjectId(projectId: string)
// - Fetch all part groups WHERE project_id, ordered by sort_order
// - For each with selectedOptionId: fetch parts for that option
// - Compute computedStatus = min status of parts (pending < ordered < owned)
// - Compute computedPrice = sum of prices if all same currency, else null
// - Compute currencies = distinct currencies
// - Return enriched objects

getPartGroupById(id: string)
// - Fetch part group by id, return null if not found

getPartGroupWithOptions(id: string)
// - Fetch part group + all its options (each with parts array)

createPartGroup(projectId: string, data: { name: string; isOptional?: boolean })
// - Count existing part groups for sort_order
// - Insert with isOptional defaulting to false

updatePartGroup(id: string, data: { name?: string; isOptional?: boolean })
// - Partial update + updatedAt

deletePartGroup(id: string)
// - Delete, return { id } or null

reorderPartGroups(projectId: string, orderedIds: string[])
// - Update sort_order for each id
// - Return full list after reorder

selectOption(partGroupId: string, optionId: string)
// - Validate option belongs to partGroupId
// - Set selected_option_id on part group
```

#### `server/src/services/options.ts`

```typescript
listOptionsByPartGroupId(partGroupId: string)
// - Fetch options WHERE part_group_id, ordered by created_at
// - For each option: fetch its parts array
// - Return options with embedded parts

getOptionById(id: string)
// - Fetch option + its parts array

createOption(partGroupId: string, data: { name: string; firstPart: { ... } })
// - In a transaction:
//   1. Insert option (name, partGroupId)
//   2. Insert first part (all fields, optionId from step 1)
//   3. Count options for this part group
//   4. If count === 1, set selectedOptionId on part group
//   5. Return option with parts

updateOption(id: string, data: { name?: string })
// - Only name is updatable

deleteOption(id: string)
// - Delete option
// - If it was selected: clear selectedOptionId on parent part group
// - If exactly 1 option remains: auto-select it
```

### Input Validation (Route Level)

#### Part Groups

- `POST /projects/:projectId/part-groups`: `name` required, non-empty string
- `PUT /part-groups/:partGroupId`: at least one of `name` or `isOptional` must be provided
- `PATCH reorder`: `orderedIds` required, must be non-empty array of strings

#### Options

- `POST /part-groups/:partGroupId/options`: `name` required. `firstPart` required with `name`, `price`, `currency` as required fields. `price` must be a valid number ≥ 0. `currency` is uppercased.
- `PUT /options/:optionId`: `name` required if provided
- `PATCH select`: validate optionId belongs to the partGroupId

## Definition of Done

### Part Groups CRUD

```bash
# Create a car + project (or reuse existing)
CAR_ID=$(curl -s -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -d '{"name":"BMW E36"}' | jq -r '.data.id')

PROJECT_ID=$(curl -s -X POST http://localhost:3001/api/cars/$CAR_ID/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Cooling System"}' | jq -r '.data.id')

# Create a part group
PG_ID=$(curl -s -X POST http://localhost:3001/api/projects/$PROJECT_ID/part-groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Cooling Hoses"}' | jq -r '.data.id')
# → { "data": { "id": "...", "name": "Cooling Hoses", "isOptional": false, "sortOrder": 0, ... } }

# List part groups
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq
# → { "data": [{ ..., "computedStatus": null, "selectedOption": null }] }

# Update
curl -s -X PUT http://localhost:3001/api/part-groups/$PG_ID \
  -H "Content-Type: application/json" \
  -d '{"isOptional": true}' | jq

# Delete
curl -s -X DELETE http://localhost:3001/api/part-groups/$PG_ID | jq
# → { "data": { "id": "..." } }
```

### Options CRUD + Compound Creation

```bash
# Recreate part group
PG_ID=$(curl -s -X POST http://localhost:3001/api/projects/$PROJECT_ID/part-groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Cooling Hoses"}' | jq -r '.data.id')

# Create option with first part (compound creation)
OPT_1=$(curl -s -X POST http://localhost:3001/api/part-groups/$PG_ID/options \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kit Rein",
    "firstPart": {
      "name": "Complete Hose Set",
      "price": 150.00,
      "currency": "USD",
      "source": "FCP Euro",
      "link": "https://example.com",
      "comment": "10-piece kit"
    }
  }' | jq -r '.data.id')
# → Option created with 1 part embedded in response

# Verify auto-selection
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0].selectedOptionId'
# → Should be $OPT_1

# Verify computed fields
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0]'
# → computedStatus: "pending", selectedOption: { name: "Kit Rein", computedPrice: 150.00, currencies: ["USD"] }

# Create second option
OPT_2=$(curl -s -X POST http://localhost:3001/api/part-groups/$PG_ID/options \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mix Mishimoto + ECS",
    "firstPart": {
      "name": "Upper Radiator Hose",
      "price": 45.00,
      "currency": "USD",
      "source": "Mishimoto"
    }
  }' | jq -r '.data.id')

# Selection should NOT change
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0].selectedOptionId'
# → Still $OPT_1

# Select second option
curl -s -X PATCH http://localhost:3001/api/part-groups/$PG_ID/options/$OPT_2/select | jq

# Update option name
curl -s -X PUT http://localhost:3001/api/options/$OPT_2 \
  -H "Content-Type: application/json" \
  -d '{"name": "Mishimoto Premium + ECS"}' | jq

# List options with parts
curl -s http://localhost:3001/api/part-groups/$PG_ID/options | jq
# → Each option has a "parts" array

# Delete selected option → auto-select remaining
curl -s -X DELETE http://localhost:3001/api/options/$OPT_2 | jq
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0].selectedOptionId'
# → Should be $OPT_1 (auto-selected)
```

### Reorder

```bash
# Create 3 part groups, then reorder
curl -s -X PATCH http://localhost:3001/api/projects/$PROJECT_ID/part-groups/reorder \
  -H "Content-Type: application/json" \
  -d '{"orderedIds": ["<pg-3-id>", "<pg-1-id>", "<pg-2-id>"]}' | jq

curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '[ .data[].name ]'
# → New order reflected
```

### Error Cases

```bash
# Missing name
curl -s -X POST http://localhost:3001/api/projects/$PROJECT_ID/part-groups \
  -H "Content-Type: application/json" \
  -d '{}' | jq
# → HTTP 400, { "error": { "message": "Name is required" } }

# Option without firstPart
curl -s -X POST http://localhost:3001/api/part-groups/$PG_ID/options \
  -H "Content-Type: application/json" \
  -d '{"name": "Kit"}' | jq
# → HTTP 400, { "error": { "message": "First part is required" } }

# Select option from wrong part group
curl -s -X PATCH http://localhost:3001/api/part-groups/<wrong-pg>/options/$OPT_1/select | jq
# → HTTP 400, { "error": { "message": "Option does not belong to this part group" } }
```

### TypeScript Compilation

```bash
cd server && npx tsc --noEmit
# Must pass
```

## Acceptance Criteria

- [ ] All part group CRUD endpoints work correctly.
- [ ] Part groups are returned ordered by `sort_order`.
- [ ] Part group list includes `computedStatus` and `selectedOption` with computed price and currencies.
- [ ] `computedStatus` correctly reflects the minimum status of parts in the selected option.
- [ ] Creating an option requires a `firstPart` and creates both atomically in a transaction.
- [ ] Options are returned with their embedded `parts` array.
- [ ] Auto-selection works: first option is auto-selected; on delete, remaining single option is auto-selected.
- [ ] Selecting an option validates it belongs to the specified part group.
- [ ] Reorder updates `sort_order` for all part groups.
- [ ] Old `parts.ts` and `options.ts` route/service files are deleted and replaced.
- [ ] `index.ts` registers the new routers correctly.
- [ ] Response format matches standard: `{ data: ... }` or `{ error: { message: ... } }`.
- [ ] Server compiles without TypeScript errors.
