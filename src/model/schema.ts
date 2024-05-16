import { pgTable, text, timestamp, varchar, uuid, integer, boolean, pgEnum, json } from 'drizzle-orm/pg-core';
import ENUM from '../utils/enum';

const base = {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at'),
  created_device_ip: varchar('created_device_ip', { length: 256 }),
  updated_device_ip: varchar('updated_device_ip', { length: 256 }),
  deleted_device_ip: varchar('deleted_device_ip', { length: 256 })
};
export const message_type_enum = pgEnum('message_type', [
  ENUM.MessageType.TEXT,
  ENUM.MessageType.IMAGE,
  ENUM.MessageType.EMOJI
]);
export const message_status_enum = pgEnum('message_status', [
  ENUM.MessageStatus.SENT,
  ENUM.MessageStatus.DELIVERED,
  ENUM.MessageStatus.READ,
  ENUM.MessageStatus.UNREAD
]);
export const role_type_enum = pgEnum('role_type', [ENUM.RoleType.MEMBER, ENUM.RoleType.MEMBER]);
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
export const group_chats = pgTable('group_chats', {
  ...base,
  group_admin: uuid('group_admin').references(() => users.id, { onDelete: 'cascade' }),
  group_name: varchar('group_name', { length: 256 }).notNull(),
  group_picture_url: varchar('group_picture_url')
});
export const group_chat_members = pgTable('group_chat_members', {
  ...base,
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  joined_at: timestamp('joined_at'),
  role: role_type_enum('role')
});
export const group_messages = pgTable('group_messages', {
  ...base,
  sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  group_id: uuid('group_id').references(() => group_chats.id, { onDelete: 'cascade' }),
  message_content: text('message_content'),
  message_type: message_type_enum('message_type'),
  media_url: varchar('media_url'),
  time_stamp: timestamp('time_stamp'),
  status: message_status_enum('status')
});
export const media = pgTable('media', {
  ...base,
  uploader_id: uuid('uploader_id').references(() => users.id, { onDelete: 'cascade' }),
  file_type: varchar('file_type'),
  file_url: varchar('file_url'),
  uploaded_at: timestamp('uploaded_at')
});
export const settings = pgTable('settings', {
  ...base,
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  setting_name: varchar('setting_name'),
  setting_values: json('setting_values')
});
export const messages = pgTable('messages', {
  ...base,
  sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  receiver_id: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }),
  message_content: text('setting_name'),
  message_type: message_type_enum('message_type'),
  time_stamp: timestamp('time_stamp'),
  status: message_status_enum('status')
});

export type iUser = typeof users.$inferInsert;
