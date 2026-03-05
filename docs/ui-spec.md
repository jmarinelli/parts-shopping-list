# Shopping Lists Manager - UI Specification

## Pages

### 1. Home (Cars List)

- Displays all cars as cards or list items.
- Each car shows its name/description.
- "Add Car" button opens a modal to create a new car.
- Each car has edit and delete actions.
- Clicking a car navigates to the Car Detail page.
- Empty state: message with call-to-action to add first car.
- Loading state: skeleton or spinner while fetching.

### 2. Car Detail (Projects List)

- Displays the car name and a list of its projects.
- Each project shows its name.
- "Add Project" button opens a modal to create a new project.
- Each project has edit and delete actions.
- Clicking a project navigates to the Project Detail page.
- Empty state and loading state.

### 3. Project Detail (Parts & Options)

#### Header

- Breadcrumb navigation: `Home > Car Name > Project Name`
- Project settings button (gear icon, opens modal to configure exchange rates).

#### Totals Banner (Sticky)

- Positioned between the breadcrumb and the parts list.
- Sticks to the top when scrolling (`position: sticky`).
- Three values displayed: **Total**, **Spent** (ordered + owned), **Remaining** (pending).
- Currency selector: dropdown with currencies derived from the project's options (all options, not just selected). Changing currency refetches totals with conversion.
- "Include optionals" toggle: controls whether optional parts contribute to the totals. Toggling refetches totals.
- Missing rate warning: if a currency conversion fails due to a missing exchange rate, the banner shows a warning with a link/button to open the exchange rates modal.

#### Parts List

- Flat list/table with columns:
  - Drag handle (for reordering)
  - Name
  - Status (dropdown or badge: `pending` | `ordered` | `owned`)
  - Optional flag (badge or icon)
  - Selected option summary (name + price + currency), or "Unquoted" if no options exist
- "Add Part" button adds an inline editable row at the bottom of the list.
  - Enter saves the part via the API.
  - Escape cancels the creation and removes the row.
  - Clicking away saves the part.
- Clicking a part row opens the Options Side Panel.
- Each part has a delete action.
- Drag & drop to reorder parts (optimistic UI, revert on error).

#### Options Side Panel

- Slides in from the right (~400-450px) when a part is clicked.
- Can be closed with a close button or by pressing Escape.
- Shows the part name and its details (status, optional flag) at the top, editable inline.
- Lists all sourcing options as cards, each displaying:
  - Name/brand
  - Price + currency
  - Source
  - Link (clickable, opens in new tab)
  - Comment
- Radio button (or similar) on each option card to mark it as the selected option.
- Auto-selection: if only one option exists, it is automatically selected. A visible indicator (e.g., "Auto-selected (only option)") is shown.
- "Add Option" button opens an inline form within the panel with fields: name, price, currency (required), source, link, comment (optional).
- Edit option: opens the same inline form pre-filled with the option's data.
- Each option has edit and delete actions.

## Modals

### Create/Edit Car

- Fields: name/description.
- Submit on Enter key.

### Create/Edit Project

- Fields: name.
- Submit on Enter key.

### Create/Edit Option (Alternative)

- If the inline form within the side panel is not practical, a modal can be used instead.
- Fields: name, price, currency (required), source, link, comment (optional).

### Project Settings (Exchange Rates)

- List of currency pairs with manually entered rates.
- Currencies are derived from all distinct currencies used in the project's options (selected or not).
- Each pair has an input field for the rate (e.g., "1 USD = ___ ARS").

### Confirm Delete

- Confirmation dialog before deleting any entity (car, project, part, option).
- Warns about cascading deletes (e.g., deleting a car removes all its projects, parts, and options).

## Navigation

- Breadcrumb in the header: `Home > Car Name > Project Name`.
- Clicking any breadcrumb segment navigates to that level.

## General Patterns

- Create and edit operations for cars and projects use modals.
- Adding parts is inline within the list for faster workflow.
- Adding and editing options uses an inline form within the side panel.
- The side panel is used for viewing and managing a part's options.
- All lists support edit and delete actions on each item.
- API errors displayed as toast notifications.
- Success toasts on create, update, and delete operations.
- Loading states: skeleton or spinner while data is being fetched.
- Empty states: message with call-to-action when a list is empty.

## Keyboard Shortcuts

- Escape: closes side panel, closes modals, cancels inline part creation.
- Enter: submits modal forms, submits inline part creation, submits option form.
