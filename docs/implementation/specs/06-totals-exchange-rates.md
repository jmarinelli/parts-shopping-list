# Phase 6: Totals & Exchange Rates

## Goal

Implement project totals calculation with currency conversion and the exchange rate configuration UI. This is the final phase.

## Prerequisites

- Phases 1-5 completed: full CRUD for cars, projects, parts, and options with the complete frontend.

## Deliverables

### Database Schema

#### `exchange_rates` table

| Column        | Type          | Constraints                              |
| ------------- | ------------- | ---------------------------------------- |
| `id`          | UUID          | Primary key, default gen                 |
| `project_id`  | UUID          | Not null, FK → projects.id, cascade delete |
| `from_currency` | VARCHAR(10) | Not null                                 |
| `to_currency`   | VARCHAR(10) | Not null                                 |
| `rate`        | DECIMAL(18,6) | Not null                                 |
| `created_at`  | TIMESTAMP     | Not null, default now                    |
| `updated_at`  | TIMESTAMP     | Not null, default now                    |

- Unique constraint on `(project_id, from_currency, to_currency)`.

### API Endpoints

#### Exchange Rates

| Method | Endpoint                                  | Description                      | Request Body                                         | Response                     |
| ------ | ----------------------------------------- | -------------------------------- | ---------------------------------------------------- | ---------------------------- |
| GET    | `/api/projects/:projectId/exchange-rates` | Get all exchange rates           | —                                                    | `{ data: ExchangeRate[] }`   |
| PUT    | `/api/projects/:projectId/exchange-rates` | Upsert exchange rates            | `{ rates: [{ fromCurrency, toCurrency, rate }] }`   | `{ data: ExchangeRate[] }`   |

#### Project Totals

| Method | Endpoint                                  | Description                      | Query Params                         | Response                 |
| ------ | ----------------------------------------- | -------------------------------- | ------------------------------------ | ------------------------ |
| GET    | `/api/projects/:projectId/totals`         | Get calculated totals            | `currency`, `includeOptionals`       | `{ data: Totals }`      |

**Totals response shape:**

```json
{
  "data": {
    "total": 1500.00,
    "spent": 800.00,
    "remaining": 700.00,
    "currency": "USD",
    "availableCurrencies": ["USD", "ARS"]
  }
}
```

### Business Logic

#### Available Currencies

- Derived from all distinct currencies used in the project's options (selected or not).
- If the project has options in USD and ARS, the available currencies are `["USD", "ARS"]`.

#### Totals Calculation

1. For each part in the project:
   - If the part has no selected option → contributes $0.
   - If `includeOptionals` is `false` and the part is optional → skip.
   - Convert the selected option's price from its currency to the requested display currency using the project's exchange rates.
   - Add to the appropriate bucket based on status:
     - `pending` → remaining
     - `ordered` → spent
     - `owned` → spent
2. `total` = `spent` + `remaining`.

#### Exchange Rate Resolution

- If the option's currency matches the display currency, no conversion needed.
- If a direct rate exists (e.g., USD → ARS), use it.
- If only the inverse rate exists (e.g., ARS → USD), compute the inverse (1 / rate).
- If no rate exists between the currencies, return an error indicating which rate is missing.

### React Query Hooks

```typescript
// hooks/use-totals.ts
useTotals(projectId, currency, includeOptionals)  // GET totals → query

// hooks/use-exchange-rates.ts
useExchangeRates(projectId)         // GET exchange rates → query
useUpdateExchangeRates()            // PUT → mutation, invalidates exchange-rates + totals queries
```

### TypeScript Types

Add to `client/src/types/index.ts`:

```typescript
export interface ExchangeRate {
  id: string;
  projectId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTotals {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
  availableCurrencies: string[];
}
```

### Frontend

#### Totals Banner (Sticky)

- Positioned at the top of the Project Detail page, between the breadcrumb and the parts list.
- Sticks to the top when scrolling (`position: sticky`).
- Displays:
  - **Total**: formatted with currency code (e.g., "USD 1,500.00").
  - **Spent**: formatted with currency code.
  - **Remaining**: formatted with currency code.
- **Currency selector**: dropdown populated with `availableCurrencies` from the totals API. Changing it refetches totals in the new currency.
- **Include optionals toggle**: checkbox or switch labeled "Include optionals". Toggling refetches totals.
- If no options exist in the project, show totals as $0 with no currency selector.

#### Exchange Rates Settings Modal

- Opened via a settings/gear icon in the project header (near the breadcrumb).
- Lists all required currency pairs based on the project's available currencies.
- Each pair has an input field for the rate (e.g., "1 USD = ___ ARS").
- "Save" persists all rates via `PUT /api/projects/:projectId/exchange-rates`.
- If a conversion fails due to a missing rate, the totals banner shows a warning message with a link/button to open the exchange rates modal.

### Client Structure (additions)

```
client/src/
├── components/
│   ├── totals-banner.tsx
│   └── exchange-rates-modal.tsx
├── hooks/
│   ├── use-totals.ts
│   └── use-exchange-rates.ts
```

## Definition of Done

### Backend verification

```bash
# Prerequisites: have a project with parts and options in different currencies

# Get available currencies and totals (single currency, no conversion needed)
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → { "data": { "total": 250.00, "spent": 0, "remaining": 250.00, "currency": "USD", "availableCurrencies": ["USD"] } }

# Add an option in ARS to test multi-currency
curl -s -X POST http://localhost:3001/api/parts/<part-id>/options \
  -H "Content-Type: application/json" \
  -d '{"name":"Local Shop","price":50000,"currency":"ARS"}' | jq

# Set exchange rate
curl -s -X PUT http://localhost:3001/api/projects/$PROJECT_ID/exchange-rates \
  -H "Content-Type: application/json" \
  -d '{"rates":[{"fromCurrency":"USD","toCurrency":"ARS","rate":1200}]}' | jq

# Get totals in ARS (should convert USD prices to ARS)
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=ARS&includeOptionals=true" | jq
# → Total should include USD prices converted at 1200 rate

# Get totals in USD (should convert ARS prices to USD using inverse rate)
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → ARS prices should be divided by 1200

# Test includeOptionals=false (optional parts excluded)
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=false" | jq

# Test missing exchange rate error
# (remove exchange rates, try totals with mixed currencies)
curl -s "http://localhost:3001/api/projects/$PROJECT_ID/totals?currency=USD&includeOptionals=true" | jq
# → Should return error with missing rate info
```

### Visual verification (in browser)

```
1. Navigate to a project with parts that have options in multiple currencies.

2. Totals banner visible above the parts list.
   → Shows Total, Spent, Remaining with default currency.

3. Click the currency selector → shows available currencies (e.g., USD, ARS).
   Switch currency → totals recalculate.

4. Toggle "Include optionals" off → optional parts excluded from totals.
   Toggle back on → optional parts included.

5. Click the gear/settings icon → Exchange Rates modal opens.
   → Shows currency pairs (e.g., "1 USD = ___ ARS").
   Enter rate 1200, save.
   → Totals update with converted values.

6. Remove all exchange rates, switch to a currency that needs conversion.
   → Warning shown in totals banner: "Missing exchange rate: USD → ARS".
   → Link/button in warning opens the exchange rates modal.

7. Scroll down the parts list → totals banner sticks to the top.

8. Change a part's status from pending to ordered.
   → Totals update: amount moves from Remaining to Spent.
```

## Acceptance Criteria

- [ ] Drizzle migration creates the `exchange_rates` table with unique constraint.
- [ ] Exchange rates can be viewed and upserted per project.
- [ ] Totals endpoint returns correct total, spent, and remaining values.
- [ ] Totals respect the `includeOptionals` parameter.
- [ ] Totals convert prices to the selected display currency using project exchange rates.
- [ ] Inverse exchange rate is used when only the inverse pair is configured.
- [ ] Missing exchange rate returns a clear error message indicating which pair is missing.
- [ ] Available currencies are derived from options actually used in the project.
- [ ] Totals banner displays all three values with the selected currency.
- [ ] Totals banner is sticky (stays visible when scrolling).
- [ ] Currency selector switches the display currency and refetches totals.
- [ ] Include optionals toggle works and updates totals.
- [ ] Exchange rates modal allows configuring rates for all currency pairs.
- [ ] Banner shows a warning when a rate is missing, with a link to open the exchange rates modal.
- [ ] React Query hooks with proper cache invalidation (exchange rates → totals).
- [ ] Totals update when parts/options change (status, selection, add/delete).
