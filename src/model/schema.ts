import { pgTable, pgEnum, text, timestamp, varchar, uuid, integer, boolean, json, jsonb } from 'drizzle-orm/pg-core';
export const requestStatusEnum = pgEnum('request_status', ['pending', 'accepted', 'rejected']);
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
  name: text('name').notNull(),
  bio: text('bio').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar_public_id: text('avatar_public_id').notNull(),
  avatar_url: text('avatar_url').notNull()
});
export const otp = pgTable('otp', {
  ...base,
  email: varchar('email').notNull(),
  otp: integer('otp').notNull()
});

export const requests = pgTable('requests', {
  ...base,
  status: requestStatusEnum('status'),
  sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  receiver_id: uuid('receiver_id').references(() => users.id)
});

// // Define the attachments type
// const attachmentType = json('attachments', {
//   public_id: text('public_id').notNull(),
//   url: text('url').notNull()
// });

export const messages = pgTable('messages', {
  ...base,
  content: text('content'),
  attachments: json('attachments'),
  sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  chat_id: uuid('chat_id').references(() => chats.id, { onDelete: 'cascade' })
});
export const chats = pgTable('chats', {
  ...base,
  name: text('name'),
  group_chat: boolean('group_chat').notNull().default(false),
  members: jsonb('members'),
  creator_id: uuid('creator_id').references(() => users.id, { onDelete: 'cascade' })
});
// new design
export const contacts = pgTable('contacts', {
  ...base,
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  contact_id: uuid('contact_id').references(() => users.id, { onDelete: 'cascade' })
});
export type iUser = typeof users.$inferInsert;
export type iRequests = typeof requests.$inferInsert;
