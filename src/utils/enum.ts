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
const ENUM = {
  Status,
  MessageType,
  MessageStatus,
  RoleType
};

export default ENUM;
