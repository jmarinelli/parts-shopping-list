# Phase 3: Backend — Parts & Totals

## Goal

Implement CRUD endpoints for the new leaf Part entity (items within an option) and rework the totals/currency calculation to traverse the new three-level hierarchy.

## Prerequisites

- Phases 1-2 completed: `part_groups`, `options`, and `parts` tables exist. Part group and option endpoints are functional.

## Deliverables

### API Endpoints — Parts (Leaf Entity)

| Method | Endpoint                        | Description           | Request Body                                                    | Response              |
| ------ | ------------------------------- | --------------------- | --------------------------------------------------------------- | --------------------- |
| GET    | `/api/options/:optionId/parts`  | List parts for option | —                                                               | `{ data: Part[] }`    |
| POST   | `/api/options/:optionId/parts`  | Create a part         | `{ name, price, currency, source?, link?, comment? }`           | `{ data: Part }`      |
| GET    | `/api/parts/:partId`            | Get a part            | —                                                               | `{ data: Part }`      |
| PUT    | `/api/parts/:partId`            | Update a part         | `{ name?, price?, currency?, source?, link?, comment?, status? }` | `{ data: Part }`   |
| DELETE | `/api/parts/:partId`            | Delete a part         | —                                                               | `{ data: { id } }`    |

### Part Response Shape

```typescript
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

### Business Logic — Parts

- Status defaults to `'pending'` on creation.
- Status must be one of: `pending`, `ordered`, `owned`.
- `price` must be a valid number ≥ 0.
- `currency` is uppercased before storage.
- Updating a part's status or price affects the parent part group's computed fields (computedStatus, computedPrice) — no cache needed, these are recalculated on read.

### Totals Rework

The existing totals endpoints remain unchanged from the consumer's perspective:

| Method | Endpoint                                                              | Description          |
| ------ | --------------------------------------------------------------------- | -------------------- |
| GET    | `/api/projects/:projectId/totals?currency=USD&includeOptionals=true`  | Calculate totals     |
| GET    | `/api/projects/:projectId/exchange-rates`                             | List exchange rates  |
| PUT    | `/api/projects/:projectId/exchange-rates`                             | Upsert exchange rates|

#### `getAvailableCurrencies` — Reworked

Must now traverse the full hierarchy to find all currencies used in the project:

```sql
SELECT DISTINCT p.currency
FROM parts p
JOIN options o ON p.option_id = o.id
JOIN part_groups pg ON o.part_group_id = pg.id
WHERE pg.project_id = $1
```

This returns currencies from **all** parts across **all** options (not just selected ones), matching the existing behavior where currencies were derived from all options.

#### `calculateTotals` — Reworked

New calculation pipeline:

1. Fetch all part groups for the project with their `selectedOptionId` and `isOptional`
2. Skip part groups without a `selectedOptionId` (unquoted)
3. Skip optional part groups if `includeOptionals` is `false`
4. For each remaining part group:
   a. Fetch all parts for the selected option
   b. Skip if no parts (unquoted)
   c. **Compute part group status** = min status of its parts (`pending` < `ordered` < `owned`)
   d. **Sum each part's price** after converting to the target currency
   e. If any conversion fails (missing exchange rate), return error with `missingPair`
5. Accumulate into `total`, `spent`, and `remaining`:
   - `total` += sum of all part prices in selected option
   - If part group computed status is `pending` → add to `remaining`
   - If part group computed status is `ordered` or `owned` → add to `spent`
6. Return `{ total, spent, remaining, currency, availableCurrencies }`

**Important difference from before:** Each part within an option can have a different currency. The totals service must convert **each part's price individually** to the target currency, not just one price per part group.

#### Exchange Rate Resolution

Unchanged: direct rate → inverse rate → USD intermediary. The `resolveRate` function in `totals.ts` does not need modification.

### Server Structure (additions)

```
server/src/
├── routes/
│   └── parts.ts                # NEW (leaf entity routes)
├── services/
│   ├── parts.ts                # NEW (leaf entity service)
│   └── totals.ts               # MODIFIED (reworked calculation)
```

#### `server/src/index.ts` update

```typescript
import { partsRouter } from './routes/parts';
app.use('/api', partsRouter);
```

### Service Functions

#### `server/src/services/parts.ts` (new)

```typescript
listPartsByOptionId(optionId: string)
// - Fetch all parts WHERE option_id, ordered by created_at
// - Return array of Part objects

getPartById(id: string)
// - Fetch by id, return null if not found

createPart(optionId: string, data: { name, price, currency, source?, link?, comment? })
// - Insert with status defaulting to 'pending'
// - Uppercase currency
// - Return new Part

updatePart(id: string, data: { name?, price?, currency?, source?, link?, comment?, status? })
// - Partial update + updatedAt
// - Validate status if provided
// - Uppercase currency if provided
// - Return updated Part or null

deletePart(id: string)
// - Delete, return { id } or null
```

#### `server/src/services/totals.ts` (modified)

```typescript
getAvailableCurrencies(projectId: string)
// - JOIN parts → options → part_groups WHERE project_id
// - Return distinct currencies

calculateTotals(projectId: string, currency: string, includeOptionals: boolean)
// - Fetch part groups with selectedOptionId
// - For each: fetch parts of selected option
// - Compute status per part group = min(parts statuses)
// - Convert each part price to target currency
// - Accumulate total/spent/remaining based on part group status
// - Return totals or error with missingPair
```

### Input Validation (Route Level)

- `POST /options/:optionId/parts`: `name`, `price`, `currency` required. `price` must be a valid number ≥ 0.
- `PUT /parts/:partId`: at least one field must be provided. `status` must be one of `pending`, `ordered`, `owned` if provided. `price` must be ≥ 0 if provided.

## Definition of Done

### Parts CRUD

```bash
# Prerequisites: car, project, part group, and option exist
# (Created in Phase 2 verification)

# Add a second part to an existing option
PART_ID=$(curl -s -X POST http://localhost:3001/api/options/$OPT_1/parts \
  -H "Content-Type: application/json" \
  -d '{"name":"Lower Radiator Hose","price":35.00,"currency":"USD","source":"FCP Euro"}' | jq -r '.data.id')
# → { "data": { "id": "...", "name": "Lower Radiator Hose", "price": 35, "status": "pending", ... } }

# List parts for an option
curl -s http://localhost:3001/api/options/$OPT_1/parts | jq
# → { "data": [{ first part }, { second part }] }

# Update part status
curl -s -X PUT http://localhost:3001/api/parts/$PART_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"ordered"}' | jq
# → Part with status "ordered"

# Verify computed status on part group
curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0].computedStatus'
# → "pending" (because the first part is still pending)

# Mark first part as ordered too
curl -s -X PUT http://localhost:3001/api/parts/<first-part-id> \
  -H "Content-Type: application/json" \
  -d '{"status":"ordered"}' | jq

curl -s http://localhost:3001/api/projects/$PROJECT_ID/part-groups | jq '.data[0].computedStatus'
# → "ordered" (all parts are ordered)

# Delete a part
curl -s -X DELETE http://localhost:3001/api/parts/$PART_ID | jq
# → { "data": { "id": "..." } }
```

### Totals

```bash
# Setup: part group with selected option that has parts with prices
# Verify totals calculation
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → { "data": { "total": 150.00, "spent": 0, "remaining": 150.00, "currency": "USD", "availableCurrencies": ["USD"] } }

# Mark all parts as owned
# ... (update each part status to "owned")
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → spent should equal total, remaining should be 0

# Test with mixed currencies
# Add a part with ARS currency
curl -s -X POST http://localhost:3001/api/options/$OPT_1/parts \
  -H "Content-Type: application/json" \
  -d '{"name":"Clamp Set","price":5000,"currency":"ARS"}' | jq

# Available currencies should now include ARS
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq '.data.availableCurrencies'
# → ["ARS", "USD"]

# Without exchange rate → error
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → { "data": { "error": "Missing exchange rate", "missingPair": { "from": "ARS", "to": "USD" }, ... } }

# Configure exchange rate
curl -s -X PUT http://localhost:3001/api/projects/$PROJECT_ID/exchange-rates \
  -H "Content-Type: application/json" \
  -d '{"rates":[{"fromCurrency":"USD","toCurrency":"ARS","rate":1200}]}' | jq

# Now totals should work
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → Total includes USD parts + ARS parts converted to USD
```

### Error Cases

```bash
# Missing required fields
curl -s -X POST http://localhost:3001/api/options/$OPT_1/parts \
  -H "Content-Type: application/json" \
  -d '{"name":"Hose"}' | jq
# → HTTP 400, { "error": { "message": "Price is required" } }

# Invalid status
curl -s -X PUT http://localhost:3001/api/parts/$PART_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped"}' | jq
# → HTTP 400, { "error": { "message": "Invalid status" } }
```

### TypeScript Compilation

```bash
cd server && npx tsc --noEmit
# Must pass
```

## Acceptance Criteria

- [ ] All part CRUD endpoints work correctly.
- [ ] Parts default to `pending` status on creation.
- [ ] Updating a part's status is reflected in the parent part group's `computedStatus`.
- [ ] `getAvailableCurrencies` correctly traverses parts → options → part_groups.
- [ ] `calculateTotals` sums individual part prices with per-part currency conversion.
- [ ] Totals correctly categorize into spent/remaining based on computed part group status.
- [ ] Missing exchange rate error includes the missing pair information.
- [ ] `includeOptionals` toggle correctly excludes optional part groups from totals.
- [ ] Exchange rate endpoints remain unchanged and functional.
- [ ] Response format matches standard: `{ data: ... }` or `{ error: { message: ... } }`.
- [ ] Server compiles without TypeScript errors.
