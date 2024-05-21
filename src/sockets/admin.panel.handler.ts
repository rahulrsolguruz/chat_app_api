import { logger } from '../utils/logger';
import { EVENTS } from './events';
import { user_activity } from '../model/schema';
import ENUM from '../utils/enum';
import db from '../config/db.config';

export const userManagementEventHandler = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    const user_id = socket.user?.id;

    // Check if the user is an admin and join the admin room
    if (socket.user?.role === 'admin') {
      socket.join('admins');
      logger.info(`Admin with ID ${user_id} joined the admin room`);
    }

    // Function to log user activity
    const logUserActivity = async (activityType, targetId, targetType) => {
      try {
        await db.insert(user_activity).values({
          user_id: user_id,
          activity_type: activityType,
          target_id: targetId,
          target_type: targetType
        });
      } catch (error) {
        logger.error(`Error logging user activity: ${error.message}`);
      }
    };

    // Assume this function is called whenever a user is created, updated, or deleted
    const handleUserActivity = async (activityType, data) => {
      const { userId } = data;
      await logUserActivity(activityType, userId, ENUM.TargetType.USER);
    };

    // Listen for user created event
    socket.on(EVENTS.ADMIN.USER_CREATED, async (data) => {
      const { id, username, email } = data;
      logger.info(`New user created: User ID - ${id}, Username - ${username}, Email - ${email}`);
      // Emit event to notify clients
      socket.to('admins').emit(EVENTS.ADMIN.USER_CREATED, { id, username, email });
      await handleUserActivity(ENUM.ActivityType.USER_CREATED, data);
    });

    // Listen for user updated event
    socket.on(EVENTS.ADMIN.USER_UPDATED, async (data) => {
      await handleUserActivity(ENUM.ActivityType.USER_UPDATED, data);
      const { id, username, email } = data;
      logger.info(`New user updated: User ID - ${id}, Username - ${username}, Email - ${email}`);
      // Emit event to notify clients
      socket.to('admins').emit(EVENTS.ADMIN.USER_UPDATED, { id, username, email });
    });

    // Listen for user deleted event
    socket.on(EVENTS.ADMIN.USER_DELETED, async (data) => {
      await handleUserActivity(ENUM.ActivityType.USER_DELETED, data);
      const { id } = data;
      logger.info(`User deleted: User ID - ${id}`);
      // Emit event to notify clients
      socket.to('admins').emit(EVENTS.ADMIN.USER_DELETED, { id });
    });
  });
};

export const groupManagementEventHandler = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    const user_id = socket.user?.id;

    // Function to log group activity
    const logGroupActivity = async (activityType, targetId, targetType) => {
      try {
        await db.insert(user_activity).values({
          user_id: user_id,
          activity_type: activityType,
          target_id: targetId,
          target_type: targetType
        });
      } catch (error) {
        logger.error(`Error logging group activity: ${error.message}`);
      }
    };

    // Assume this function is called whenever a group is created, updated, a member is added, or a member is removed
    const handleGroupActivity = async (activityType, data) => {
      const { groupId, userId } = data;
      await logGroupActivity(activityType, groupId, ENUM.TargetType.GROUP);
      if (userId) {
        await logGroupActivity(ENUM.ActivityType.MEMBER_ADDED_IN_GROUP, userId, ENUM.TargetType.USER);
      }
    };

    // Listen for group created event
    socket.on(EVENTS.ADMIN.GROUP_CREATED, async (data) => {
      const { group_id, group_name, group_picture_url, group_admin } = data;
      logger.info(`New group created: Group ID - ${group_id}, Group Name - ${group_name}, Created By - ${group_admin}`);
      // Emit event to notify clients
      io.emit(EVENTS.ADMIN.GROUP_CREATED, { group_id, group_name, group_picture_url, group_admin });
      await handleGroupActivity(ENUM.ActivityType.GROUP_CREATED, data);
    });

    // Listen for group updated event
    socket.on(EVENTS.ADMIN.GROUP_UPDATED, async (data) => {
      await handleGroupActivity(ENUM.ActivityType.GROUP_UPDATED, data);
      const { group_id, group_name } = data;
      logger.info(`Group updated: Group ID - ${group_id}, Changes - ${group_name}`);
      // Emit event to notify clients
      io.emit(EVENTS.ADMIN.GROUP_UPDATED, { group_id, group_name });
    });

    // Listen for group member added event
    socket.on(EVENTS.ADMIN.GROUP_MEMBER_ADDED, async (data) => {
      await handleGroupActivity(ENUM.ActivityType.MEMBER_ADDED_IN_GROUP, data);

      const { user_id, group_id, role } = data;
      logger.info(`Member added to group: Group ID - ${group_id}, User ID - ${user_id}`);
      // Emit event to notify clients
      io.emit(EVENTS.ADMIN.GROUP_MEMBER_ADDED, { group_id, user_id, role });
    });

    // Listen for group member removed event
    socket.on(EVENTS.ADMIN.GROUP_MEMBER_REMOVED, async (data) => {
      await handleGroupActivity(ENUM.ActivityType.MEMBER_REMOVED_IN_GROUP, data);
      const { user_id, group_id, role } = data;
      logger.info(`Member removed from group: Group ID - ${group_id}, User ID - ${user_id}`);
      // Emit event to notify clients
      io.emit(EVENTS.ADMIN.GROUP_MEMBER_REMOVED, { group_id, user_id, role });
    });
  });
};
