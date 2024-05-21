enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  DOCUMENT = 'document',
  EMOJI = 'emoji'
}

enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  UNREAD = 'unread'
}
enum RoleType {
  MEMBER = 'member',
  ADMIN = 'admin'
}
enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BANNED = 'banned',
  UNBANNED = 'unbanned'
}
enum ActivityType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
  USER_JOINED_GROUP = 'user_joined_group',
  USER_UPDATED_GROUP = 'user_updated_group',
  USER_DELETED_GROUP = 'user_deleted_group',
  MEMBER_ADDED_IN_GROUP = 'member_added_in_group',
  MEMBER_REMOVED_IN_GROUP = 'member_removed_in_group',
  MEMBER_SEND_MESSAGE_IN_GROUP = 'member_send_message_in_group',
  MEMBER_DELETED_MESSAGE_IN_GROUP = 'member_deleted_message_in_group',
  USER_LEFT_GROUP = 'user_left_group',
  USER_SENT_MESSAGE = 'user_sent_message',
  USER_DELETED_MESSAGE = 'user_deleted_message',
  USER_ADDED_CONTACT = 'user_added_contact',
  USER_REMOVED_CONTACT = 'user_removed_contact',
  USER_CREATED_GROUP = 'USER_CREATED_GROUP',
  GROUP_CREATED = 'group_created',
  GROUP_UPDATED = 'group_updated'
}
enum TargetType {
  USER = 'user',
  GROUP = 'group',
  MESSAGE = 'message',
  MEDIA = 'media',
  SETTING = 'setting'
}
enum messagesStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated',
  ACTION_TAKEN = 'action_taken',
  USER_NOTIFIED = 'user_notified',
  AWAITING_RESPONSE = 'awaiting_response',
  CLOSED = 'closed'
}
const ENUM = {
  Status,
  MessageType,
  MessageStatus,
  RoleType,
  UserStatus,
  ActivityType,
  TargetType,
  messagesStatus
};

export default ENUM;
