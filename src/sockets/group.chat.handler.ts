import { and, eq, or } from 'drizzle-orm';
import db from '../config/db.config';
import { group_chat_members, group_chats, group_messages, users } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';
import { ioResponse } from '../utils/common.functions';
import { errorMessage, successMessage } from '../config/constant.config';

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

const sendResponse = (socket, event, success, message, data = {}) => {
  socket.emit(event, { success, message, data });
};

export const groupChatHandler = (socket) => {
  const user_id = socket.user?.id;

  socket.on(EVENTS.GROUP_CHAT.CREATE, async (data) => {
    const { group_name, group_picture_url } = data;

    try {
      const group_admin = user_id;

      const newGroupChat = {
        group_admin,
        group_name,
        group_picture_url
      };

      const [result] = await db.insert(group_chats).values(newGroupChat).returning({
        group_id: group_chats.id
      });

      if (!result) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.CREATE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return sendResponse(socket, EVENTS.GROUP_CHAT.CREATE, true, successMessage.ADDED('Group Chat'), result);
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.CREATE, false, 'Failed to create group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.UPDATE, async (data) => {
    const { group_id, newGroupName, newGroupPictureUrl } = data;

    try {
      const [group] = await db
        .select({ group_id: group_chats.id })
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, errorMessage.NOT_EXIST('Group Chat'));
      }

      const [updatedGroup] = await db
        .update(group_chats)
        .set({ group_name: newGroupName, group_picture_url: newGroupPictureUrl })
        .where(eq(group_chats.id, group_id))
        .returning({
          group_id: group_chats.id,
          group_name: group_chats.group_name,
          group_picture_url: group_chats.group_picture_url
        });

      if (!updatedGroup) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return sendResponse(socket, EVENTS.GROUP_CHAT.UPDATE, true, successMessage.UPDATED('Group Chat'), updatedGroup);
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, 'Failed to update group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.DELETE, async (data) => {
    const { group_id } = data;

    try {
      const [group] = await db
        .select({ group_id: group_chats.id })
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.NOT_EXIST('Group Chat'));
      }

      const [deleteCount] = await db
        .update(group_chats)
        .set({ deleted_at: new Date() })
        .where(eq(group_chats.id, group_id));

      if (!deleteCount) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, true, successMessage.DELETED('Group Chat'));
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, 'Failed to delete group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.ADD_MEMBER, async (data) => {
    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chat_members)
        .where(
          and(
            eq(group_chat_members.id, group_id),
            eq(group_chat_members.user_id, user_id),
            eq(group_chat_members.role, ENUM.RoleType.ADMIN)
          )
        );

      if (!isAdmin) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, member_id)));

      if (isMember) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.EXIST('Member'));
      }

      await db.insert(group_chat_members).values({ user_id: member_id, group_id, role: ENUM.RoleType.MEMBER });

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_ADDED, { member_id });
      return sendResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, true, successMessage.ADDED('Member'));
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, 'Failed to add member to group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.REMOVE_MEMBER, async (data) => {
    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chat_members)
        .where(
          and(
            eq(group_chat_members.id, group_id),
            eq(group_chat_members.user_id, user_id),
            eq(group_chat_members.role, ENUM.RoleType.ADMIN)
          )
        );

      if (!isAdmin) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [deleteCount] = await db
        .delete()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, member_id)));

      if (!deleteCount) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_REMOVED, { member_id });
      return sendResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, true, successMessage.REMOVED('Member'));
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, 'Failed to remove member from group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.SEND_MESSAGE, async (data) => {
    const { group_id, message_content, message_type, media_url } = data;

    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, user_id)));

      if (!isMember) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const newMessage = {
        sender_id: user_id,
        group_id,
        message_content,
        message_type: ENUM.MessageType[message_type],
        media_url,
        time_stamp: new Date(),
        status: ENUM.MessageStatus.SENT
      };

      const [result] = await db.insert(group_messages).values(newMessage).returning({
        message_id: group_messages.id,
        message_content: group_messages.message_content,
        message_type: group_messages.message_type,
        media_url: group_messages.media_url,
        time_stamp: group_messages.time_stamp,
        status: group_messages.status
      });

      if (!result) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.RECEIVE_MESSAGE, result);
      return sendResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, true, successMessage.ADDED('Message'), result);
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, 'Failed to send group message');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.GET_MESSAGES, async (data) => {
    const { group_id, page = 1, limit = 10 } = data;
    const offset = (page - 1) * limit;

    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, user_id)));

      if (!isMember) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.GET_MESSAGES, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const totalMessagesResult = await db
        .select(db.raw('COUNT(*) AS count'))
        .from(group_messages)
        .where(eq(group_messages.group_id, group_id));

      const totalMessages = totalMessagesResult ? totalMessagesResult.count : 0;

      const messages = await db
        .select({
          message_id: group_messages.id,
          sender_id: group_messages.sender_id,
          message_content: group_messages.message_content,
          message_type: group_messages.message_type,
          media_url: group_messages.media_url,
          time_stamp: group_messages.time_stamp,
          status: group_messages.status,
          sender_username: users.username
        })
        .from(group_messages)
        .join(users, eq(group_messages.sender_id, users.id))
        .where(eq(group_messages.group_id, group_id))
        .limit(limit)
        .offset(offset)
        .orderBy(group_messages.time_stamp, 'asc');

      const responseData = {
        message: successMessage.FETCHED('Group Messages'),
        total: totalMessages,
        limit,
        skip: offset,
        data: messages
      };

      return sendResponse(
        socket,
        EVENTS.GROUP_CHAT.GET_MESSAGES,
        true,
        successMessage.FETCHED('Group Messages'),
        responseData
      );
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.GET_MESSAGES, false, 'Failed to get group messages');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.DELETE, async (data) => {
    const { group_id, message_id } = data;

    try {
      const [isSenderOrAdmin] = await db
        .select()
        .from(group_messages)
        .join(group_chat_members, eq(group_messages.group_id, group_chat_members.id))
        .where(
          and(
            eq(group_messages.id, message_id),
            eq(group_chat_members.id, group_id),
            eq(group_chat_members.user_id, user_id),
            or(eq(group_chat_members.role, ENUM.RoleType.ADMIN), eq(group_messages.sender_id, user_id))
          )
        );

      if (!isSenderOrAdmin) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const deleteCount = await db.delete(group_messages).where(eq(group_messages.id, message_id));

      if (!deleteCount) {
        return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MESSAGE_DELETED, { message_id });
      return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, true, successMessage.DELETED('Message'));
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, 'Failed to delete group message');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.GET_MEMBERS, async (data) => {
    const { group_id } = data;

    try {
      const memberList = await db
        .select({
          user_id: group_chat_members.user_id,
          role: group_chat_members.role,
          username: users.username,
          email: users.email
        })
        .from(group_chat_members)
        .join(users, eq(group_chat_members.user_id, users.id))
        .where(eq(group_chat_members.id, group_id));

      return sendResponse(
        socket,
        EVENTS.GROUP_CHAT.GET_MEMBERS,
        true,
        successMessage.FETCHED('Group Chat Members'),
        memberList
      );
    } catch (error) {
      return sendResponse(socket, EVENTS.GROUP_CHAT.GET_MEMBERS, false, 'Failed to get group chat members');
    }
  });
};
