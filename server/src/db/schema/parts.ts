import {
  pgTable,
  uuid,
  varchar,
  decimal,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
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
