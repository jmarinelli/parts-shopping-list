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
