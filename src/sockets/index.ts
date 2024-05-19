import { EVENTS } from './events';
import { groupChatHandler } from './group.chat.handler';
import { messageEventHandlers } from './message.handlers';
import { oneToOneChatHandler } from './one.to.one.chat.handler';
import { userStatusHandler } from './user.status.handler';

export const setupSocketHandlers = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    console.log('A user connected');

    // Initialize all handlers
    oneToOneChatHandler(socket);
    userStatusHandler(socket);
    messageEventHandlers(socket);
    groupChatHandler(socket);
    socket.on(EVENTS.DISCONNECT, () => {
      console.log('A user disconnected');
    });
  });
};
