import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { cars } from './cars';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  carId: uuid('car_id')
    .notNull()
    .references(() => cars.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
