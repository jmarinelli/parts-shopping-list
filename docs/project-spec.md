# Shopping Lists Manager - Project Specification

## Overview

A web application for managing DIY automotive project shopping lists. The app helps users track parts needed for vehicle projects, compare sourcing options, and monitor spending.

## Data Model

### Car

- Name/description (e.g., "BMW E36 328i")
- Has many projects

### Project

- Name (e.g., "Cooling System Overhaul")
- Belongs to a car
- Exchange rates: manually configured per project, one rate per currency pair
- Has many parts

### Part

- Name (e.g., "Radiator", "Water Pump")
- Status: `pending` | `ordered` | `owned`
- Optional: boolean flag
- Sort order: user-defined (drag & drop reordering)
- Has many options
- Has one selected option (determines the part's cost)
- Belongs to a project

### Option (Sourcing Option)

- Name/brand (e.g., "Mishimoto", "OEM BMW")
- Price: numeric value
- Currency: (e.g., USD, ARS)
- Source: where to buy (e.g., "FCP Euro", "MercadoLibre")
- Link: URL to the listing
- Comment: free-text notes
- Belongs to a part

## Business Rules

### Option Selection

- Each part can have exactly one selected option at a time (not zero, not multiple).
- When a part has only one option, that option is automatically selected.
- When a new option is created and it is the only option for the part, it is automatically selected.
- When the selected option is deleted, the selection is cleared. If exactly one option remains, it is automatically selected.
- The selected option determines the part's cost.

### Part Cost

- If a part has no options, it is displayed as "unquoted" and contributes $0 to totals.
- If a part has a selected option, that option's price is the part's cost.

### Part Status

| Status    | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `pending` | Not yet purchased                                    |
| `ordered` | Purchased but not yet received/in hand               |
| `owned`   | Already in hand (bought for this project or already had) |

### Project Totals

Three values are displayed for each project:

1. **Total**: sum of all parts
2. **Spent**: sum of `ordered` + `owned` parts
3. **Remaining**: sum of `pending` parts

Additional rules:

- An "include optionals" toggle controls whether optional parts are included in the totals.
- The user can select which currency to display totals in. The available currencies are derived from all distinct currencies used in the project's part options (all options, not just selected ones).
- Conversion between currencies uses the exchange rates manually configured at the project level:
  - If a direct rate exists (e.g., USD → ARS), it is used.
  - If only the inverse rate exists (e.g., ARS → USD), the inverse (1 / rate) is computed.
  - If no rate exists between the currencies, an error is shown indicating which rate is missing.

### Currencies

- Each option stores its price in a specific currency.
- A project can have options in multiple currencies.
- Exchange rates are configured manually per project (e.g., 1 USD = 1200 ARS).
- Totals can be viewed in any currency that has been used in the project's options.

## Persistence

- All data must be persisted. The user expects to close and reopen the app with all data intact.

## UI Requirements

- Parts within a project support manual reordering (drag & drop).
- Part list is flat (no categories or grouping).

## Scope Boundaries (Out of Scope for Now)

- Multi-user support / authentication
- Part categories or grouping within a project
- Automatic exchange rate fetching
- Import/export functionality
