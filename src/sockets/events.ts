export const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  USER: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    LAST_SEEN: 'last_seen',
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
    LAST_SEEN_RESPONSE: 'last_seen_response',
    ONLINE_RESPONSE: 'online_response',
    OFFLINE_RESPONSE: 'offline_response'
  },
  MESSAGE: {
    SEND: 'send_message',
    DELIVERED: 'message_delivered',
    READ: 'message_read',
    RECEIVE: 'receive_message',
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',
    GET_MESSAGES: 'get_messages',
    GET_MESSAGES_RESPONSE: 'get_messages_response',
    REQUEST_HISTORY: 'request_history',
    RECEIVE_HISTORY: 'receive_history'
  },
  GROUP_CHAT: {
    JOIN: 'join_group',
    CREATED: 'create_group_chat',
    UPDATED: 'update_group_chat',
    DELETED: 'delete_group_chat',
    ADD_MEMBER: 'add_member_to_group_chat',
    REMOVE_MEMBER: 'remove_member_from_group_chat',
    SEND_MESSAGE: 'send_group_message',
    RECEIVE_MESSAGE: 'receive_group_message',
    GET_MEMBERS: 'get_group_chat_members',
    GET_MESSAGES: 'get_group_messages',
    MEMBER_ADDED: 'member_added',
    MEMBER_REMOVED: 'member_removed',
    MESSAGE_DELETED: 'message_deleted'
  },
  ADMIN: {
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    GROUP_CREATED: 'group_created',
    GROUP_UPDATED: 'group_updated',
    GROUP_MEMBER_ADDED: 'member_added',
    GROUP_MEMBER_REMOVED: 'member_added'
  }
};
