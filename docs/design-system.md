# Shopping Lists Manager - Design System

Dark industrial aesthetic. Guided by the `design-taste-frontend` skill.

- **DESIGN_VARIANCE**: 3 (Predictable, symmetrical layouts)
- **MOTION_INTENSITY**: 4 (CSS transitions only, no Framer Motion needed)
- **VISUAL_DENSITY**: 4 (Standard app spacing, not too airy, not packed)

Visual reference: `docs/examples/design-system-showcase.html`

## Component Library

**shadcn/ui** — customized to dark industrial theme. Not used in its default state.

- Built on Radix UI primitives + Tailwind CSS.
- Components are copied into the project (`client/src/components/ui/`), not installed as a dependency.
- shadcn/ui must be initialized with the "zinc" base color and dark mode.
- Key components to use: Button, Dialog (for modals), DropdownMenu, Select, Switch (for toggles), Toast (Sonner), Input, Label, Badge, RadioGroup, Sheet (for side panel).

## Typography

- **Primary font**: `Geist` (sans-serif) — for all UI text.
- **Monospace font**: `Geist Mono` — for prices, numbers, labels, breadcrumbs, helper text, badges.
- **No Inter, no serif fonts** in the dashboard.
- Monospace is used heavily to reinforce the industrial/technical feel.

| Element          | Class                                                          |
| ---------------- | -------------------------------------------------------------- |
| Page heading     | `text-2xl font-semibold tracking-tighter`                      |
| Section heading  | `text-base font-medium tracking-tight`                         |
| Section label    | `text-[11px] font-semibold uppercase tracking-widest font-mono text-muted` |
| Body text        | `text-sm text-secondary`                                       |
| Prices/numbers   | `font-mono text-sm font-medium text-amber-500`                 |
| Small/helper     | `text-xs font-mono text-muted`                                 |

## Color Palette

Dark neutral base with amber accent. No purple, no neon, no pure black.

### Surfaces

Use CSS custom properties for consistency. These map to Tailwind's dark zinc scale.

| Token          | Hex        | Tailwind approx  | Usage                          |
| -------------- | ---------- | ----------------- | ------------------------------ |
| `--bg`         | `#0c0c0e`  | —                 | Page background                |
| `--surface`    | `#161618`  | `zinc-900`        | Cards, panels, table bg        |
| `--surface-raised` | `#1c1c1f` | `zinc-850`   | Modals, raised cards, hover    |
| `--surface-hover`  | `#222225` | `zinc-800`   | Hover states                   |
| `--border`     | `#2a2a2d`  | `zinc-750`        | Default borders                |
| `--border-subtle` | `#222225` | `zinc-800`    | Subtle dividers (table rows)   |
| `--border-strong` | `#3a3a3d` | `zinc-700`    | Hover borders, emphasis        |

### Text

| Token            | Hex        | Usage                              |
| ---------------- | ---------- | ---------------------------------- |
| `--text-primary` | `#ececef`  | Headings, primary content          |
| `--text-secondary` | `#8b8b8e` | Body text, descriptions           |
| `--text-muted`   | `#5c5c5f`  | Labels, helpers, placeholders      |

### Accent (Amber)

| Token            | Value                        | Usage                          |
| ---------------- | ---------------------------- | ------------------------------ |
| Primary          | `amber-500` / `#f59e0b`     | Primary buttons, prices, focus rings |
| Primary hover    | `amber-600` / `#d97706`     | Button hover                   |
| Muted            | `amber-800` / `#92400e`     | —                              |
| Subtle bg        | `rgba(245, 158, 11, 0.08)`  | Selected row background        |
| Subtle border    | `rgba(245, 158, 11, 0.25)`  | Selected option card border    |

### Status Colors

All status colors use low-opacity backgrounds with bright text for dark theme contrast.

| Status    | Background                      | Text           | Border                         |
| --------- | ------------------------------- | -------------- | ------------------------------ |
| `pending` | `rgba(245, 158, 11, 0.08)`     | `amber-400`    | `rgba(245, 158, 11, 0.2)`     |
| `ordered` | `rgba(59, 130, 246, 0.08)`     | `blue-400`     | `rgba(59, 130, 246, 0.2)`     |
| `owned`   | `rgba(34, 197, 94, 0.08)`      | `green-400`    | `rgba(34, 197, 94, 0.2)`      |

### Semantic Colors

| Purpose     | Value          | Usage                                |
| ----------- | -------------- | ------------------------------------ |
| Destructive | `red-500`      | Delete buttons (semi-transparent bg) |
| Warning     | `amber-500`    | Missing exchange rate warnings       |
| Success     | `green-500`    | Success toasts                       |
| Error       | `red-500`      | Error toasts                         |

## Spacing & Layout

- Page container: `max-w-7xl mx-auto px-6`.
- Card/section padding: `p-4` to `p-5` (tighter than typical light themes).
- Grid over flex-math: use CSS Grid for multi-column layouts.
- Consistent gap: `gap-3` between list items, `gap-4` between sections.
- Border radius: `rounded-md` (6px) everywhere. No `rounded-lg` or `rounded-full` except badges.

## Shadows & Borders

- Prefer `border border-[--border]` over shadows for most containers.
- Shadows only for elevated floating elements (modals, dropdowns, toasts): `shadow-lg` with dark shadow color.
- Modal shadow: `shadow-[0_8px_32px_rgba(0,0,0,0.4)]`.
- No outer glows or neon shadows.

## Icons

- Use **Phosphor Icons** (`@phosphor-icons/react`).
- Consistent weight: `weight="regular"` (stroke width ~1.5).
- Icon size in UI: `size={16}` for inline, `size={20}` for buttons and actions.
- Icon color defaults to `text-muted`, brightens to `text-secondary` on hover.

## Component Patterns

### Buttons

| Variant       | Style                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Primary       | `bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-600`                |
| Secondary     | `bg-surface-raised border border-border text-primary hover:bg-surface-hover hover:border-border-strong` |
| Ghost         | `text-secondary hover:bg-surface-raised hover:text-primary`                  |
| Destructive   | `bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15`   |

Active state: `active:scale-[0.97]` for tactile feedback.

### Cards

- Dark surface: `bg-[--surface] border border-[--border] rounded-md`.
- Hover: `hover:border-[--border-strong] hover:bg-[--surface-raised]`.
- Use cards sparingly — for car cards and option cards.
- For data lists (parts list), prefer table rows with `divide-y divide-[--border-subtle]`.

### Modals (Dialog)

- Centered, with backdrop: `bg-black/60 backdrop-blur-[4px]`.
- Modal surface: `bg-[--surface-raised] border border-[--border] rounded-md`.
- Max width: `max-w-md` for simple forms, `max-w-lg` for exchange rates.
- Shadow: `shadow-[0_8px_32px_rgba(0,0,0,0.4)]`.

### Side Panel (Sheet)

- Slides from right, width ~`w-[400px]`.
- Background: `bg-[--surface-raised]`.
- Left border: `border-l border-[--border]`.

### Badges (Status)

- Small, slightly rounded: `text-[11px] font-medium font-mono uppercase tracking-wide px-2 py-0.5 rounded border`.
- Use the status colors defined above (semi-transparent backgrounds).

### Toast Notifications

- Use Sonner (via shadcn/ui toast component).
- Dark toast surface: `bg-[--surface-raised] border border-[--border]`.
- Position: top-right.
- Auto-dismiss after 3-4 seconds.
- Status dot (6px circle) instead of icon: green for success, red for error.

### Inputs

- Background: `bg-[--surface]`.
- Border: `border border-[--border]`.
- Focus: `border-amber-500 ring-2 ring-amber-500/10`.
- Label: `text-[11px] font-mono uppercase tracking-wide text-secondary`.
- Placeholder: `text-muted`.

### Separators

- Use `//` as inline separator in option metadata (e.g., "FCP Euro // view listing").
- Use `/` as breadcrumb separator.

## States

### Loading

- Skeleton loaders matching component layout sizes (not generic spinners).
- Use `animate-pulse` on `bg-[--surface-hover]` blocks.
- Slower pulse: `duration-[1.8s]`.

### Empty

- Centered message with a subtle icon in a bordered box.
- Icon container: `bg-[--surface-raised] border border-[--border] rounded-lg`.
- Description in monospace.
- Call-to-action button (primary).

### Error

- Inline error for form validation (red text below input).
- Toast for API errors.

### Selected/Active

- Selected part row: `bg-[amber-500/8]` (amber subtle background).
- Selected option card: `border-[amber-500/25] bg-[amber-500/8]`.

### Warning

- Warning banner: `bg-[amber-500/8] border border-[amber-500/20] text-amber-400 font-mono`.
- Includes link/button to resolve the issue (e.g., configure exchange rates).

## Motion

Minimal, CSS-only (no Framer Motion). Consistent with `MOTION_INTENSITY: 4`.

| Element           | Transition                                      |
| ----------------- | ----------------------------------------------- |
| Buttons           | `transition-all duration-150`                   |
| Side panel        | `transition-transform duration-200 ease-out`    |
| Modals            | `transition-opacity duration-150`               |
| Hover on cards    | `transition-[border-color,background] duration-150` |
| Active press      | `active:scale-[0.97] transition-transform`      |

No scroll animations, no parallax, no infinite loops. This is a utility app.
