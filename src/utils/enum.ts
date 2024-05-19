enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  VOICE: 'voice',
  DOCUMENT: 'document',
  EMOJI: 'emoji'
};

const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  UNREAD: 'unread'
};
const RoleType = {
  MEMBER: 'member',
  ADMIN: 'admin'
};
const UserStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};
const ENUM = {
  Status,
  MessageType,
  MessageStatus,
  RoleType,
  UserStatus
};

export default ENUM;
