export const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  USER: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    LAST_SEEN: 'last_seen',
    USER_ONLINE: 'userOnline',
    USER_OFFLINE: 'userOffline',
    LAST_SEEN_RESPONSE: 'lastSeenResponse',
    ONLINE_RESPONSE: 'onlineResponse',
    OFFLINE_RESPONSE: 'offlineResponse'
  },
  MESSAGE: {
    SEND: 'sendMessage',
    DELIVERED: 'messageDelivered',
    RECEIVE: 'receiveMessage',
    TYPING: 'typing',
    STOP_TYPING: 'stopTyping',
    GET_MESSAGES: 'getMessages',
    GET_MESSAGES_RESPONSE: 'getMessagesResponse'
  },
  GROUP_CHAT: {
    CREATE: 'createGroupChat',
    UPDATE: 'updateGroupChat',
    DELETE: 'deleteGroupChat',
    ADD_MEMBER: 'addMemberToGroupChat',
    REMOVE_MEMBER: 'removeMemberFromGroupChat',
    SEND_MESSAGE: 'sendGroupMessage',
    RECEIVE_MESSAGE: 'receiveGroupMessage',
    GET_MEMBERS: 'getGroupChatMembers',
    GET_MESSAGES: 'getGroupMessages',
    MEMBER_ADDED: 'memberAdded',
    MEMBER_REMOVED: 'memberRemoved',
    MESSAGE_DELETED: 'messageDeleted'
  }
};
