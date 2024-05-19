import { logger } from '../utils/logger';
import { EVENTS } from './events';

export const messageEventHandlers = (socket) => {
  logger.info(`User connected: ${socket.id}`);
  const user_id = socket.user?.id;
  if (user_id) {
    socket.join(user_id);
    logger.info(`User with ID ${user_id} joined room ${user_id}`);
  }

  // Handle typing indicator
  socket.on(EVENTS.MESSAGE.TYPING, (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { receiver_id } = data;
    const sender_id = socket.user?.id;
    socket.to(receiver_id).emit(EVENTS.MESSAGE.TYPING, { sender_id });
    logger.info(`User is typing the receiver_id is :${receiver_id} and sender_id is ${sender_id} `);
  });

  // Handle stop typing indicator
  socket.on(EVENTS.MESSAGE.STOP_TYPING, (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { receiver_id } = data;
    const sender_id = socket.user?.id;
    socket.to(receiver_id).emit(EVENTS.MESSAGE.STOP_TYPING, { sender_id });
  });

  // Handle message read
  socket.on('messageRead', ({ sender_id, receiver_id, message_id }) => {
    socket.to(sender_id).emit('messageRead', { receiver_id, message_id });
  });
};
