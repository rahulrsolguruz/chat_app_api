import { eq } from 'drizzle-orm';
import db from '../config/db.config';
import { users } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';
import { ioResponse } from '../utils/common.functions';

const updateUserStatus = async (user_id, status) => {
  await db.update(users).set({ status: status, last_seen: new Date() }).where(eq(users.id, user_id));
};

export const userStatusHandler = (socket) => {
  const user_id = socket.user?.id;

  if (user_id) {
    socket.join(user_id);
    logger.info(`User with ID ${user_id} joined room ${user_id}`);

    // Set user online when connected
    socket.on(EVENTS.USER.ONLINE, async () => {
      if (user_id) {
        try {
          await updateUserStatus(user_id, ENUM.UserStatus.ONLINE);
          socket.broadcast.emit(EVENTS.USER.USER_ONLINE, { user_id });
        } catch (error) {
          ioResponse(socket, EVENTS.USER.ONLINE_RESPONSE, false, 'Failed to update status');
        }
      }
    });
  }

  // Handle user offline
  socket.on(EVENTS.USER.OFFLINE, async () => {
    if (user_id) {
      try {
        await updateUserStatus(user_id, ENUM.UserStatus.OFFLINE);
        socket.broadcast.emit(EVENTS.USER.USER_OFFLINE, { user_id });
      } catch (error) {
        ioResponse(socket, EVENTS.USER.OFFLINE_RESPONSE, false, 'Failed to update status');
      }
    }
  });

  // Update last seen
  socket.on(EVENTS.USER.LAST_SEEN, async () => {
    if (user_id) {
      try {
        await updateUserStatus(user_id, ENUM.UserStatus.OFFLINE);
        ioResponse(socket, EVENTS.USER.LAST_SEEN_RESPONSE, true, 'Last seen updated successfully');
      } catch (error) {
        ioResponse(socket, EVENTS.USER.LAST_SEEN_RESPONSE, false, 'Failed to update last seen');
      }
    }
  });

  socket.on(EVENTS.DISCONNECT, async () => {
    if (user_id) {
      try {
        await updateUserStatus(user_id, ENUM.UserStatus.OFFLINE);
        socket.broadcast.emit(EVENTS.USER.USER_OFFLINE, { user_id });
      } catch (error) {
        logger.error('Failed to update user status on disconnect', error);
      }
    }
  });
};
