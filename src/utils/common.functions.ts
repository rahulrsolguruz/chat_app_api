import { logger } from './logger';

export const userSocketIDs = new Map();
export const onlineUsers = new Set();
export const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user.toString()));

  return sockets;
};
export const emitEvent = (req, event, users, data?) => {
  const io = req.app.get('io');
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};
export const ioResponse = (socket, event, success, message, data = {}) => {
  socket.emit(event, { success, message, data });
};
export const formatData = (data, socket) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      logger.error(`Error parsing JSON: ${error.message}`);
      socket.emit('error', { message: 'Invalid JSON format' });
      return;
    }
  }
};
