import { pgTable, text, timestamp, varchar, uuid, integer, boolean } from 'drizzle-orm/pg-core';

const base = {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at'),
  created_device_ip: varchar('created_device_ip', { length: 256 }),
  updated_device_ip: varchar('updated_device_ip', { length: 256 }),
  deleted_device_ip: varchar('deleted_device_ip', { length: 256 })
};

export const users = pgTable('users', {
  ...base,
  username: varchar('username', { length: 256 }).notNull().unique(),
  phone_number: varchar('phone_number', { length: 256 }).unique(),
  email: varchar('email', { length: 256 }).unique(),
  password: text('password').notNull(),
  profile_picture_url: text('profile_picture_url'),
  status_message: text('status_message'),
  last_seen: timestamp('last_seen'),
  is_online: boolean('is_online').notNull().default(false)
});

export const otp = pgTable('otp', {
  ...base,
  email: varchar('email').notNull(),
  otp: integer('otp').notNull()
});

export const contacts = pgTable('contacts', {
  ...base,
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  contact_id: uuid('contact_id').references(() => users.id, { onDelete: 'cascade' })
});
export type iUser = typeof users.$inferInsert;
