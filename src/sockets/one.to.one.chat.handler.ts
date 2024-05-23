import { desc } from 'drizzle-orm';
import db from '../config/db.config';
import { messages, user_activity } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';

export const oneToOneChatHandler = async (io) => {
  io.on(EVENTS.CONNECTION, async (socket) => {
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

    // Handle message delivery receipt
    socket.on(EVENTS.MESSAGE.DELIVERED, async (data) => {
      const { message_id } = data;
      try {
        await db.update(messages).set({ status: ENUM.MessageStatus.DELIVERED }).where({ id: message_id });
        socket.emit(EVENTS.MESSAGE.DELIVERED, { message_id });
        logger.info(`Message with ID ${message_id} marked as delivered`);
      } catch (error) {
        logger.error(`Error marking message as delivered: ${error.message}`);
      }
    });
    // Handle message delivery receipt
    socket.on(EVENTS.MESSAGE.DELIVERED, async (data) => {
      const { message_id } = data;
      try {
        await db.update(messages).set({ status: ENUM.MessageStatus.DELIVERED }).where({ id: message_id });
        socket.emit(EVENTS.MESSAGE.DELIVERED, { message_id });
        logger.info(`Message with ID ${message_id} marked as delivered`);
      } catch (error) {
        logger.error(`Error marking message as delivered: ${error.message}`);
      }
    });
    // Handle message read receipt
    socket.on(EVENTS.MESSAGE.READ, async (data) => {
      const { message_id } = data;
      try {
        await db.update(messages).set({ status: ENUM.MessageStatus.READ }).where({ id: message_id });
        socket.emit(EVENTS.MESSAGE.READ, { message_id });
        logger.info(`Message with ID ${message_id} marked as read`);
      } catch (error) {
        logger.error(`Error marking message as read: ${error.message}`);
      }
    });
    // Handle typing indicator
    socket.on(EVENTS.MESSAGE.TYPING, (data) => {
      const { receiver_id } = data;
      const sender_id = socket.user?.id;
      socket.to(receiver_id).emit(EVENTS.MESSAGE.TYPING, { sender_id });
      logger.info(`User is typing the receiver_id is :${receiver_id} and sender_id is ${sender_id} `);
    });
    // Handle request for older messages
    socket.on(EVENTS.MESSAGE.REQUEST_HISTORY, async (data) => {
      const MESSAGE_PAGE_SIZE = 20; // total messages per page
      const { receiver_id, page } = data;
      const sender_id = socket.user?.id;

      try {
        const offset = (page - 1) * MESSAGE_PAGE_SIZE;
        const history = await db
          .select('*')
          .from(messages)
          .where({ sender_id, receiver_id })
          .orWhere({ sender_id: receiver_id, receiver_id: sender_id })
          .orderBy(desc(messages.time_stamp))
          .offset(offset)
          .limit(MESSAGE_PAGE_SIZE);

        socket.emit(EVENTS.MESSAGE.RECEIVE_HISTORY, { history });
        logger.info(`Sent message history to user: ${sender_id}`);
      } catch (error) {
        logger.error(`Error fetching message history: ${error.message}`);
        socket.emit('error', { message: 'Failed to fetch message history', error });
      }
    });
  });
};
