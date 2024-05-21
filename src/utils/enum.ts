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
  OFFLINE = 'offline'
}
enum ActivityType {
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
  USER_JOINED_GROUP = 'user_joined_group',
  USER_LEFT_GROUP = 'user_left_group',
  USER_SENT_MESSAGE = 'user_sent_message',
  USER_DELETED_MESSAGE = 'user_deleted_message',
  USER_ADDED_CONTACT = 'user_added_contact',
  USER_REMOVED_CONTACT = 'user_removed_contact'
}
enum TargetType {
  USER = 'user',
  GROUP = 'group',
  MESSAGE = 'message',
  MEDIA = 'media',
  SETTING = 'setting'
}
const ENUM = {
  Status,
  MessageType,
  MessageStatus,
  RoleType,
  UserStatus,
  ActivityType,
  TargetType
};

export default ENUM;
