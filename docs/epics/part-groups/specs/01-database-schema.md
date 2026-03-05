# Phase 1: Database Schema & Migration

## Goal

Replace the current `parts` and `options` tables with a three-level hierarchy: `part_groups` → `options` → `parts`.

## Prerequisites

- Phases 1-2 of the original implementation plan completed: server running, cars and projects tables exist.
- Database is accessible via Docker Compose dev setup.

## Deliverables

### Tables to Drop

The old `parts` and `options` tables are dropped entirely. **All existing parts and options data will be lost.** Cars, projects, and exchange rates are preserved.

### New Database Schema

#### `part_groups` table (replaces old `parts`)

| Column               | Type         | Constraints                                          |
| -------------------- | ------------ | ---------------------------------------------------- |
| `id`                 | UUID         | Primary key, default gen                             |
| `project_id`         | UUID         | Not null, FK → projects.id, cascade delete           |
| `name`               | VARCHAR(255) | Not null                                             |
| `is_optional`        | BOOLEAN      | Not null, default `false`                            |
| `sort_order`         | INTEGER      | Not null                                             |
| `selected_option_id` | UUID         | Nullable, FK → options.id, set null on delete        |
| `created_at`         | TIMESTAMP    | Not null, default now                                |
| `updated_at`         | TIMESTAMP    | Not null, default now                                |

Note: no `status` column. Status is computed from the parts in the selected option.

#### `options` table (simplified)

| Column          | Type         | Constraints                                          |
| --------------- | ------------ | ---------------------------------------------------- |
| `id`            | UUID         | Primary key, default gen                             |
| `part_group_id` | UUID         | Not null, FK → part_groups.id, cascade delete        |
| `name`          | VARCHAR(255) | Not null                                             |
| `created_at`    | TIMESTAMP    | Not null, default now                                |
| `updated_at`    | TIMESTAMP    | Not null, default now                                |

Note: `price`, `currency`, `source`, `link`, `comment` are removed. These fields now live on `parts`.

#### `parts` table (new leaf entity)

| Column       | Type           | Constraints                                          |
| ------------ | -------------- | ---------------------------------------------------- |
| `id`         | UUID           | Primary key, default gen                             |
| `option_id`  | UUID           | Not null, FK → options.id, cascade delete            |
| `name`       | VARCHAR(255)   | Not null                                             |
| `price`      | DECIMAL(12,2)  | Not null                                             |
| `currency`   | VARCHAR(10)    | Not null                                             |
| `source`     | VARCHAR(255)   | Nullable                                             |
| `link`       | TEXT           | Nullable                                             |
| `comment`    | TEXT           | Nullable                                             |
| `status`     | VARCHAR(20)    | Not null, default `'pending'`. Enum: `pending`, `ordered`, `owned` |
| `created_at` | TIMESTAMP      | Not null, default now                                |
| `updated_at` | TIMESTAMP      | Not null, default now                                |

### Circular Foreign Key

`part_groups.selected_option_id` references `options.id`, while `options.part_group_id` references `part_groups.id`. This is the same circular FK pattern already used in the codebase. Handle it with Drizzle's `AnyPgColumn` lazy reference:

```typescript
selectedOptionId: uuid('selected_option_id')
  .references((): AnyPgColumn => options.id, { onDelete: 'set null' }),
```

### Cascade Delete Chain

```
projects → part_groups → options → parts
```

Deleting a project cascades through all three levels.

### Schema Files

```
server/src/db/schema/
├── cars.ts              # unchanged
├── projects.ts          # unchanged
├── part-groups.ts       # NEW (replaces old parts.ts)
├── options.ts           # REWRITTEN (simplified)
├── parts.ts             # REWRITTEN (new leaf entity)
└── exchange-rates.ts    # unchanged
```

### Drizzle Schema Definitions

#### `server/src/db/schema/part-groups.ts`

```typescript
import {
  AnyPgColumn,
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { options } from './options';

export const partGroups = pgTable('part_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  isOptional: boolean('is_optional').notNull().default(false),
  sortOrder: integer('sort_order').notNull(),
  selectedOptionId: uuid('selected_option_id').references(
    (): AnyPgColumn => options.id,
    { onDelete: 'set null' }
  ),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### `server/src/db/schema/options.ts`

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { partGroups } from './part-groups';

export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  partGroupId: uuid('part_group_id')
    .notNull()
    .references(() => partGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### `server/src/db/schema/parts.ts`

```typescript
import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { options } from './options';

export const parts = pgTable('parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  optionId: uuid('option_id')
    .notNull()
    .references(() => options.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  source: varchar('source', { length: 255 }),
  link: text('link'),
  comment: text('comment'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Migration

```bash
cd server && npx drizzle-kit generate
cd server && npx drizzle-kit migrate
```

If Drizzle Kit cannot generate a clean migration automatically, write the SQL manually and add it to `server/drizzle/`. The SQL should:

1. Drop the old foreign key from `parts.selected_option_id → options.id`
2. Drop old `options` table
3. Drop old `parts` table
4. Create `part_groups` table
5. Create new `options` table
6. Create new `parts` table
7. Add all foreign key constraints

## Definition of Done

### Migration

```bash
cd server && npx drizzle-kit generate
cd server && npx drizzle-kit migrate

# Verify tables exist
docker exec -it <db-container> psql -U postgres -d shopping_lists -c "\dt"
# → Should list: cars, projects, part_groups, options, parts, exchange_rates

# Verify old tables are gone
docker exec -it <db-container> psql -U postgres -d shopping_lists \
  -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'part_groups' ORDER BY ordinal_position"
# → id, project_id, name, is_optional, sort_order, selected_option_id, created_at, updated_at

docker exec -it <db-container> psql -U postgres -d shopping_lists \
  -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'options' ORDER BY ordinal_position"
# → id, part_group_id, name, created_at, updated_at

docker exec -it <db-container> psql -U postgres -d shopping_lists \
  -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'parts' ORDER BY ordinal_position"
# → id, option_id, name, price, currency, source, link, comment, status, created_at, updated_at
```

### TypeScript Compilation

```bash
cd server && npx tsc --noEmit
# Must pass — all service and route files that reference the old schema will break.
# Those files will be fixed in Phases 2-3, but the schema files themselves must compile.
```

### Cascade Verification

```bash
docker exec -it <db-container> psql -U postgres -d shopping_lists -c "
  SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('part_groups', 'options', 'parts')
  ORDER BY tc.table_name;
"
# Should show:
# part_groups.project_id → projects.id (CASCADE)
# part_groups.selected_option_id → options.id (SET NULL)
# options.part_group_id → part_groups.id (CASCADE)
# parts.option_id → options.id (CASCADE)
```

## Acceptance Criteria

- [ ] Old `parts` and `options` tables are dropped.
- [ ] `part_groups` table is created with correct columns and constraints.
- [ ] `options` table is recreated with only id, part_group_id, name, and timestamps.
- [ ] `parts` table is created as the new leaf entity with price, currency, source, link, comment, and status.
- [ ] Circular FK between `part_groups.selected_option_id` and `options.id` works correctly.
- [ ] Cascade deletes chain properly: project → part_groups → options → parts.
- [ ] Cars, projects, and exchange_rates tables and data are preserved.
- [ ] Drizzle migration file is generated and applied successfully.
- [ ] Schema files compile without TypeScript errors.
