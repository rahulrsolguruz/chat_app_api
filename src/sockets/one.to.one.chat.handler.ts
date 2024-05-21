import db from '../config/db.config';
import { messages, user_activity } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';

export const oneToOneChatHandler = async (socket) => {
  const user_id = socket.user?.id;
  await db.insert(user_activity).values({
    user_id: user_id,
    target_id: user_id,
    activity_type: ENUM.ActivityType.USER_CONNECTED
  });

  if (user_id) {
    socket.join(user_id);
    logger.info(`User with ID ${user_id} joined room ${user_id}`);
    await db.insert(user_activity).values({
      user_id: user_id,
      activity_type: ENUM.ActivityType.USER_JOINED_GROUP,
      target_id: user_id,
      target_type: ENUM.TargetType.USER
    });
  }

  socket.on(EVENTS.MESSAGE.SEND, async (data) => {
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
        await db.insert(user_activity).values({
          user_id: user_id,
          activity_type: ENUM.ActivityType.USER_SENT_MESSAGE,
          target_id: user_id,
          target_type: ENUM.TargetType.MESSAGE
        });
        logger.info(`Message sent to room, receiver_id : ${receiver_id}: message_id: ${result.message_id}`);
      }
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
      socket.emit('error', { message: 'Message sending failed', error });
    }
  });
  // Handle typing indicator
  socket.on(EVENTS.MESSAGE.TYPING, (data) => {
    const { receiver_id } = data;
    const sender_id = socket.user?.id;
    socket.to(receiver_id).emit(EVENTS.MESSAGE.TYPING, { sender_id });
    logger.info(`User is typing the receiver_id is :${receiver_id} and sender_id is ${sender_id} `);
  });

  // Handle stop typing indicator
  socket.on(EVENTS.MESSAGE.STOP_TYPING, (data) => {
    const { receiver_id } = data;
    const sender_id = socket.user?.id;
    socket.to(receiver_id).emit(EVENTS.MESSAGE.STOP_TYPING, { sender_id });
  });
};
