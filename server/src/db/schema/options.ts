import {
  pgTable,
  uuid,
  varchar,
  decimal,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { parts } from './parts';

export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  partId: uuid('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  source: varchar('source', { length: 255 }),
  link: text('link'),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
