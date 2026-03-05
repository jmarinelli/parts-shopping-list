import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    fromCurrency: varchar('from_currency', { length: 10 }).notNull(),
    toCurrency: varchar('to_currency', { length: 10 }).notNull(),
    rate: decimal('rate', { precision: 18, scale: 6 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('exchange_rates_project_currency_pair').on(
      table.projectId,
      table.fromCurrency,
      table.toCurrency,
    ),
  ],
);
