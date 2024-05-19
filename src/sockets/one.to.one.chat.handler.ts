import db from '../config/db.config';
import { messages } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';

export const oneToOneChatHandler = (socket) => {
  logger.info(`User connected: ${socket.id}`);
  const user_id = socket.user?.id;
  if (user_id) {
    socket.join(user_id);
    logger.info(`User with ID ${user_id} joined room ${user_id}`);
  }

  socket.on(EVENTS.MESSAGE.SEND, async (data) => {
    logger.info(`Raw incoming data: ${JSON.stringify(data)}`);

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { receiver_id, message_content } = data;
    const sender_id = socket.user?.id;

    if (!receiver_id || !message_content || !sender_id) {
      logger.warn('Missing required fields');
      socket.emit('error', { message: 'Invalid data' });
      return;
    }

    try {
      const [result] = await db
        .insert(messages)
        .values({
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        })
        .returning({
          message_id: messages.id
        });

      if (result) {
        socket.to(receiver_id).emit(EVENTS.MESSAGE.RECEIVE, {
          message_id: result.message_id,
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        });
        logger.info(`Message sent to room ${receiver_id}: ${result.message_id}`);
      }
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
      socket.emit('error', { message: 'Message sending failed', error });
    }
  });

  socket.on(EVENTS.DISCONNECT, () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
};
