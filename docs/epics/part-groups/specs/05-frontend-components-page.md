# Phase 5: Frontend — Components & Page

## Goal

Rewrite the project detail page and all related components to work with the new Part Group → Option → Part hierarchy.

## Prerequisites

- Phases 1-4 completed: all backend endpoints functional, frontend types and hooks ready.

## Deliverables

### Component Changes Overview

| Component              | Change    | Description                                                      |
| ---------------------- | --------- | ---------------------------------------------------------------- |
| `project-detail.tsx`   | Modified  | Updated hooks, state, and callback wiring                        |
| `parts-list.tsx`       | Modified  | Works with `PartGroup[]`, status is read-only                    |
| `part-row.tsx`         | Modified  | Displays `PartGroup` with computed status badge                  |
| `options-panel.tsx`    | Rewritten | Two-level management: options with nested parts                  |
| `option-card.tsx`      | Rewritten | Shows option with expandable parts list and per-part status      |
| `option-form.tsx`      | Modified  | Compound form: option name + first part fields                   |
| `part-form.tsx`        | New       | Form for creating/editing individual parts within an option      |
| `totals-banner.tsx`    | Unchanged | Consumes same totals endpoint                                    |
| `exchange-rates-modal` | Unchanged | No structural changes                                            |

### Client Structure

```
client/src/
├── components/
│   ├── parts-list.tsx          # MODIFIED
│   ├── part-row.tsx            # MODIFIED
│   ├── options-panel.tsx       # REWRITTEN
│   ├── option-card.tsx         # REWRITTEN
│   ├── option-form.tsx         # MODIFIED
│   ├── part-form.tsx           # NEW
│   ├── totals-banner.tsx       # unchanged
│   ├── exchange-rates-modal.tsx# unchanged
│   ├── car-card.tsx            # unchanged
│   └── project-card.tsx        # unchanged
├── pages/
│   ├── project-detail.tsx      # MODIFIED
│   ├── home.tsx                # unchanged
│   └── car-detail.tsx          # unchanged
```

---

### `project-detail.tsx` — Modified

#### State Changes

```typescript
// Old
const [selectedPart, setSelectedPart] = useState<Part | null>(null);

// New
const [selectedPartGroup, setSelectedPartGroup] = useState<PartGroup | null>(null);
```

The `freshSelectedPart` pattern becomes `freshSelectedPartGroup`:

```typescript
const freshSelectedPartGroup = selectedPartGroup
  ? partGroups?.find((pg) => pg.id === selectedPartGroup.id) ?? null
  : null;
```

#### Hook Changes

```typescript
// Old
const { data: parts } = useParts(projectId);
const createPart = useCreatePart();
const updatePart = useUpdatePart();
const deletePart = useDeletePart();
const reorderParts = useReorderParts();
const { data: options } = useOptions(selectedPart?.id);
const createOption = useCreateOption();
// ...

// New
const { data: partGroups } = usePartGroups(projectId);
const createPartGroup = useCreatePartGroup();
const updatePartGroup = useUpdatePartGroup();
const deletePartGroup = useDeletePartGroup();
const reorderPartGroups = useReorderPartGroups();
const { data: options } = useOptions(selectedPartGroup?.id);
const createOption = useCreateOption();
const updateOption = useUpdateOption();
const deleteOption = useDeleteOption();
const selectOption = useSelectOption();
const createPart = useCreatePart();
const updatePart = useUpdatePart();
const deletePart = useDeletePart();
```

#### Callback Wiring

The page is the single source of truth for all mutation calls. It passes callbacks down to components:

- **PartsList**: `onCreatePartGroup`, `onDeletePartGroup`, `onReorder`, `onSelectPartGroup`
- **OptionsPanel**: `onUpdatePartGroup`, `onCreateOption`, `onUpdateOption`, `onDeleteOption`, `onSelectOption`, `onCreatePart`, `onUpdatePart`, `onDeletePart`, `onClose`

---

### `parts-list.tsx` — Modified

#### Props

```typescript
interface PartsListProps {
  partGroups: PartGroup[];
  selectedPartGroupId: string | null;
  onSelectPartGroup: (pg: PartGroup) => void;
  onCreatePartGroup: (name: string) => void;
  onDeletePartGroup: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  isCreating: boolean;
}
```

#### Changes from Current

- Works with `PartGroup[]` instead of `Part[]`
- **No `onStatusChange` prop** — status is computed, not directly editable at this level
- Column headers: Drag Handle | Name | Status | Selected Option | Delete
- Status column shows a **read-only badge** (not a `<select>`) with the `computedStatus`
- If `computedStatus` is `null`, show "—" or a neutral badge
- "Add Part" button text/label can remain "Add Part Group" or just "Add" — keep it concise
- Empty state message: "No parts yet. Add your first part group!"
- Inline creation works the same way: input at the bottom, Enter saves, Escape cancels
- dnd-kit setup is identical, just using `PartGroup` type and `onReorder`

---

### `part-row.tsx` — Modified

#### Props

```typescript
interface PartRowProps {
  partGroup: PartGroup;
  isSelected: boolean;
  onSelect: (pg: PartGroup) => void;
  onDelete: (pg: PartGroup) => void;
  // No onStatusChange — status is read-only
}
```

#### Changes from Current

- Displays `PartGroup` instead of `Part`
- Status badge is **read-only**: colored badge showing `computedStatus`
  - `pending`: amber
  - `ordered`: blue
  - `owned`: green
  - `null`: gray/muted "—"
- Selected option column shows: `selectedOption.name` + price formatted
  - If `selectedOption` is null: "Unquoted"
  - If `computedPrice` is not null: `$${computedPrice.toFixed(2)} ${currencies[0]}` (single currency case)
  - If `computedPrice` is null and currencies exist: show currencies list or "Mixed currencies"
- Optional badge remains the same
- No status `<select>` dropdown — removed entirely

---

### `options-panel.tsx` — Rewritten

This is the biggest UI change. The panel now manages two levels: options and their parts.

#### Props

```typescript
interface OptionsPanelProps {
  partGroup: PartGroup;
  options: Option[] | undefined;
  isLoadingOptions: boolean;
  onClose: () => void;
  // Part group mutations
  onUpdatePartGroup: (data: { name?: string; isOptional?: boolean }) => void;
  // Option mutations
  onCreateOption: (data: {
    name: string;
    firstPart: {
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    };
  }) => void;
  onUpdateOption: (optionId: string, data: { name?: string }) => void;
  onDeleteOption: (optionId: string) => void;
  onSelectOption: (optionId: string) => void;
  // Part mutations (leaf entity)
  onCreatePart: (
    optionId: string,
    data: {
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    }
  ) => void;
  onUpdatePart: (
    partId: string,
    data: {
      name?: string;
      price?: number;
      currency?: string;
      source?: string | null;
      link?: string | null;
      comment?: string | null;
      status?: 'pending' | 'ordered' | 'owned';
    }
  ) => void;
  onDeletePart: (partId: string) => void;
  isCreatingOption: boolean;
  isUpdatingOption: boolean;
  isCreatingPart: boolean;
  isUpdatingPart: boolean;
}
```

#### Panel Structure

```
┌─────────────────────────────────┐
│ Header (sticky)                 │
│  - Part group name (editable)   │
│  - Computed status badge (r/o)  │
│  - Optional checkbox            │
│  - Close button                 │
├─────────────────────────────────┤
│ Body (scrollable)               │
│                                 │
│  "Sourcing Options"             │
│                                 │
│  ┌ Option Card ───────────────┐ │
│  │ ○ Kit Rein          $150   │ │
│  │                            │ │
│  │  Part 1: Hose Set   $150  │ │
│  │    USD · FCP Euro · ✓owned │ │
│  │                            │ │
│  │  [+ Add Part]              │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌ Option Card ───────────────┐ │
│  │ ● Mix Mishi+ECS     $175  │ │
│  │                            │ │
│  │  Part 1: Upper Hose  $45  │ │
│  │    USD · Mishimoto · pending│ │
│  │  Part 2: Lower Hose  $35  │ │
│  │    USD · Mishimoto · ordered│ │
│  │  Part 3: Heater Hose $30  │ │
│  │    ARS · ECS · pending     │ │
│  │                            │ │
│  │  [+ Add Part]              │ │
│  └────────────────────────────┘ │
│                                 │
│  [+ Add Option]                 │
│                                 │
└─────────────────────────────────┘
```

#### Header

- Part group name: editable inline (click to edit, same pattern as current)
- Computed status: **read-only badge** (no dropdown). Shows `computedStatus` or "—" if null.
- Optional checkbox: toggles `isOptional` via `onUpdatePartGroup`
- Close button (X)
- **No status dropdown** — removed

#### Body

- "Sourcing Options" label
- List of `OptionCard` components
- "Add Option" button at the bottom → toggles `OptionForm` (compound creation form)
- Skeleton loader while `isLoadingOptions`
- Empty state: "No options yet. Add your first option!"
- `isOnlyOption` flag passed to option cards for auto-select indicator

#### Escape Key Behavior

- If a form (option or part) is open → close the form
- Otherwise → close the panel

---

### `option-card.tsx` — Rewritten

#### Props

```typescript
interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  isAutoSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  // Part management within this option
  onCreatePart: (data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) => void;
  onUpdatePart: (
    partId: string,
    data: {
      name?: string;
      price?: number;
      currency?: string;
      source?: string | null;
      link?: string | null;
      comment?: string | null;
      status?: 'pending' | 'ordered' | 'owned';
    }
  ) => void;
  onDeletePart: (partId: string) => void;
  isCreatingPart: boolean;
  isUpdatingPart: boolean;
}
```

#### Layout

```
┌─────────────────────────────────────┐
│ ○/● Option Name    $Total   ✎ 🗑   │ ← radio, name, computed total, actions
│                                     │
│   Part 1 Name                       │
│   $45.00 USD · FCP Euro · [status▾] │ ← price, currency, source, status dropdown
│   🔗 view listing                   │ ← link (if present)
│   "Some comment"                    │ ← comment (if present)
│                                     │ ← edit/delete actions on hover
│   Part 2 Name                       │
│   $35.00 USD · ECS Tuning · [stat▾] │
│   ...                               │
│                                     │
│   [+ Add Part]                      │ ← add part button
│                                     │
│   "Auto-selected (only option)"     │ ← if isAutoSelected
└─────────────────────────────────────┘
```

#### Key Behaviors

- **Option header**: radio button for selection, option name (editable inline or via edit button), computed total price (sum of parts), edit and delete action buttons
- **Computed total**: sum all parts prices. If mixed currencies, show each currency total separately (e.g., "$80 USD + $5000 ARS")
- **Parts list**: each part shows name, price + currency, source, link, comment, and a **status dropdown** (editable `<select>`, since status lives on Part)
- **Part status dropdown**: same styling as the current status select (colored per status)
- **Part actions**: edit and delete buttons, visible on hover
- **"Add Part" button**: opens inline `PartForm` at the bottom of the parts list
- **Edit part**: opens `PartForm` pre-filled with part data (replaces the part row temporarily)
- **Delete part**: confirmation modal before deleting
- Selected option styling: amber border/background tint (same as current)

---

### `option-form.tsx` — Modified

The creation form now collects both option name and first part data:

#### Create Mode

```
┌─────────────────────────────────────┐
│ Option Name: [___________________]  │
│                                     │
│ First Part                          │
│ Name:     [___________________]     │
│ Price:    [________] Currency: [___] │
│ Source:   [___________________]     │
│ Link:     [___________________]     │
│ Comment:  [___________________]     │
│                                     │
│             [Cancel]  [Save]        │
└─────────────────────────────────────┘
```

#### Edit Mode

When editing an existing option, only the option name is editable:

```
┌─────────────────────────────────────┐
│ Option Name: [___________________]  │
│                                     │
│             [Cancel]  [Save]        │
└─────────────────────────────────────┘
```

#### Props

```typescript
interface OptionFormProps {
  option?: Option;  // undefined = create mode, defined = edit mode
  onSubmit: (data: {
    name: string;
    firstPart?: {
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    };
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}
```

In create mode, `firstPart` is always included. In edit mode, only `name` is sent.

Validation:
- Create mode: option name required, first part name required, price required and ≥ 0, currency required
- Edit mode: option name required

---

### `part-form.tsx` — New

Form for creating/editing individual parts within an option. Reuses the same field layout as the part fields in `option-form.tsx`.

#### Props

```typescript
interface PartFormProps {
  part?: Part;  // undefined = create mode
  onSubmit: (data: {
    name: string;
    price: number;
    currency: string;
    source?: string;
    link?: string;
    comment?: string;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}
```

#### Fields

- Name (required, text, autofocus)
- Price (required, number, step 0.01, min 0) + Currency (required, text, maxLength 10) — side by side
- Source (optional, text)
- Link (optional, text)
- Comment (optional, text)

Same validation and behavior as the current `OptionForm` inner fields: currency uppercased, empty optionals sent as undefined.

Use the `key` remounting pattern (same as current `OptionForm`) to ensure fresh state between create/edit transitions.

---

## Definition of Done

### Visual Verification (in browser)

```
Prerequisites: have a car and project created.

1. Navigate to a project → Project Detail page loads.
   → Empty state: "No parts yet" with CTA.

2. Click "Add Part Group" → inline editable row appears.
   Type "Cooling Hoses", press Enter.
   → Part group row appears: name "Cooling Hoses", status "—", "Unquoted".

3. Click the "Cooling Hoses" row → side panel slides in.
   → Header: "Cooling Hoses", status "—", optional checkbox unchecked.
   → Body: "No options yet. Add your first option!"

4. Click "Add Option" → compound form appears.
   Fill: Option name "Kit Rein", Part name "Complete Hose Set",
   price 150, currency USD, source "FCP Euro".
   Save.
   → Option card appears with 1 part listed.
   → Auto-selected (radio filled, "Auto-selected" note).
   → Part group row updates: "Kit Rein — $150.00 USD", status "pending".

5. Within the "Kit Rein" option card, click "Add Part".
   Fill: name "Clamp Set", price 15, currency USD.
   Save.
   → Two parts visible in the option card.
   → Option total updates to $165.00.
   → Part group row updates to $165.00.

6. Change the status of "Complete Hose Set" to "owned" via its status dropdown.
   → Part status updates.
   → Part group computed status stays "pending" (because "Clamp Set" is pending).

7. Change "Clamp Set" to "owned".
   → Part group computed status becomes "owned".

8. Add a second option "Mix Mishimoto + ECS" with first part "Upper Hose" $45 USD.
   → Two option cards visible. First still selected.

9. Add another part to second option: "Lower Hose" $35 USD.
   → Second option shows 2 parts, total $80.

10. Click radio on "Mix Mishimoto + ECS" → it becomes selected.
    → Part group row updates: "Mix Mishimoto + ECS — $80.00 USD", status "pending".

11. Edit the option name "Mix Mishimoto + ECS" → change to "Premium Mix".
    → Name updates in card and part group row.

12. Edit a part within the option (change price, source, etc.).
    → Part details update. Totals recalculate.

13. Delete a part within an option → confirmation → part removed.
    → Option total recalculates.

14. Delete an option → confirmation → option removed.
    → If one remains, auto-selected.

15. Verify totals banner reflects all changes in real-time.

16. Drag & drop reorder part groups → order persists after refresh.

17. Delete a part group → confirmation → removed with all options and parts.
```

### Keyboard Interaction

```
- Escape closes the side panel (if no form is open).
- Escape closes an open form (option or part form).
- Escape cancels inline part group creation.
- Enter submits inline part group creation.
- Enter submits option form.
- Enter submits part form.
```

### TypeScript Compilation

```bash
cd client && npx tsc --noEmit
# Must pass with zero errors
```

### ESLint

```bash
cd client && npx eslint src/
# Must pass
```

## Acceptance Criteria

- [ ] Project detail page renders part groups ordered by `sort_order`.
- [ ] Part groups show name, computed status (read-only badge), and selected option summary.
- [ ] User can add a part group inline at the bottom of the list.
- [ ] User can delete a part group with confirmation.
- [ ] Drag & drop reorders part groups with optimistic UI, persists via API.
- [ ] Clicking a part group opens the side panel with its options.
- [ ] Side panel header shows part group name (editable), computed status (read-only), optional checkbox.
- [ ] Options are listed as cards with their parts visible.
- [ ] "Add Option" opens compound form (option name + first part fields).
- [ ] Each option card shows computed total price (sum of parts).
- [ ] "Add Part" button within each option card opens the part form.
- [ ] Each part shows name, price, currency, source, link, comment, and editable status dropdown.
- [ ] Part status changes update the part group's computed status in real-time.
- [ ] User can edit and delete individual parts within an option.
- [ ] User can edit option name and delete options.
- [ ] Auto-selection indicator shown when only one option exists.
- [ ] "Unquoted" shown for part groups with no options.
- [ ] Totals banner reflects all part/option/status changes.
- [ ] Side panel can be closed with X button or Escape key.
- [ ] All forms can be cancelled with Escape.
- [ ] Loading and empty states for part groups list and options list.
- [ ] Error and success toasts on all mutations.
- [ ] Client compiles without TypeScript errors.
- [ ] ESLint passes.
