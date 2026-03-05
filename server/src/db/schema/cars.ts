import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
