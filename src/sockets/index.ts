import { messageEventHandlers } from './message.handlers';
import { oneToOneChatHandler } from './one.to.one.chat.handler';
import { userStatusHandler } from './user.status.handler';
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Initialize all handlers
    oneToOneChatHandler(socket);
    userStatusHandler(socket);
    messageEventHandlers(socket);
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};
