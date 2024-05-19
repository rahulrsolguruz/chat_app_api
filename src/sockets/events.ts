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
  }
};
