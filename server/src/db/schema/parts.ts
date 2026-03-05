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

export const parts = pgTable('parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  isOptional: boolean('is_optional').notNull().default(false),
  sortOrder: integer('sort_order').notNull(),
  selectedOptionId: uuid('selected_option_id').references(
    (): AnyPgColumn => options.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
