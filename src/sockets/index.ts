import { logger } from '../utils/logger';
import { groupManagementEventHandler, userManagementEventHandler } from './admin.panel.handler';
import { EVENTS } from './events';
import { groupChatHandler } from './group.chat.handler';

import { oneToOneChatHandler } from './one.to.one.chat.handler';
import { userStatusHandler } from './user.status.handler';

export const setupSocketHandlers = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    // Initialize all handlers
    oneToOneChatHandler(io);
    userStatusHandler(socket);
    groupChatHandler(socket, io);
    // admin
    userManagementEventHandler(socket);
    groupManagementEventHandler(socket);
    socket.on(EVENTS.DISCONNECT, () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};
