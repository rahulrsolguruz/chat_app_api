import { and, eq, or } from 'drizzle-orm';
import db from '../config/db.config';
import { group_chat_members, group_chats, group_messages, role_type_enum } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';
import { ioResponse } from '../utils/common.functions';
import { errorMessage, successMessage } from '../config/constant.config';

export const groupChatHandler = (socket, io) => {
  const user_id = socket.user?.id;

  // Create group chat
  socket.on(EVENTS.GROUP_CHAT.CREATED, async (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }
    const { group_name, group_picture_url } = data;

    try {
      const group_admin = user_id;
      const newGroupChat = { group_admin, group_name, group_picture_url };

      const [result] = await db.insert(group_chats).values(newGroupChat).returning({
        id: group_chats.id,
        group_name: group_chats.group_name,
        group_admin: group_chats.group_admin,
        group_picture_url: group_chats.group_picture_url,
        created_at: group_chats.created_at
      });
      const newGroupChatMembers = {
        user_id: result.group_admin,
        group_id: result.id,
        joined_at: new Date(),
        role: role_type_enum.enumValues[0]
      };
      await db.insert(group_chat_members).values(newGroupChatMembers).returning();

      if (!result) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.CREATED, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.emit(EVENTS.GROUP_CHAT.CREATED, result);
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      socket.emit(EVENTS.GROUP_CHAT.CREATED, { success: false, message: 'Failed to create group chat' });
    }
  });

  // Update group chat
  socket.on(EVENTS.GROUP_CHAT.UPDATED, async (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }
    const { group_id, newGroupName, newGroupPictureUrl } = data;

    try {
      const [group] = await db
        .select()
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATED, false, errorMessage.NOT_EXIST('Group Chat'));
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
        return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATED, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.emit(EVENTS.GROUP_CHAT.UPDATED, updatedGroup);
    } catch (error) {
      socket.emit(EVENTS.GROUP_CHAT.UPDATED, { success: false, message: 'Failed to update group chat' });
    }
  });

  // Delete group chat
  socket.on(EVENTS.GROUP_CHAT.DELETED, async (data) => {
    try {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (error) {
          logger.error(`Error parsing JSON: ${error.message}`);
          socket.emit('error', { message: 'Invalid JSON format' });
          return;
        }
      }
      const { group_id } = data;
      const [group] = await db
        .select()
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, false, errorMessage.NOT_EXIST('Group Chat'));
      }

      const [deleteCount] = await db
        .update(group_chats)
        .set({ deleted_at: new Date() })
        .where(eq(group_chats.id, group_id))
        .returning();

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.emit(EVENTS.GROUP_CHAT.DELETED, { group_id });
    } catch (error) {
      console.log(error);
      socket.emit(EVENTS.GROUP_CHAT.DELETED, { success: false, message: 'Failed to delete group chat' });
    }
  });

  socket.on(EVENTS.GROUP_CHAT.JOIN, async (data) => {
    const user_id = socket.user?.id;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }
    const { group_id } = data;
    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, user_id)));

      if (isMember) {
        socket.join(group_id);
        console.log(`${user_id} joined group ${group_id}`);
      } else {
        socket.emit('error', { message: 'Unauthorized access to group chat' });
      }
    } catch (error) {
      console.error(`Error joining group: ${error.message}`);
      socket.emit('error', { message: 'Failed to join group' });
    }
  });

  // Add member to group chat
  socket.on(EVENTS.GROUP_CHAT.ADD_MEMBER, async (data) => {
    handleAddMember(socket, data);
  });

  // Remove member from group chat
  socket.on(EVENTS.GROUP_CHAT.REMOVE_MEMBER, async (data) => {
    handleRemoveMember(socket, data);
  });

  // Send message to group chat
  socket.on(EVENTS.GROUP_CHAT.SEND_MESSAGE, async (data) => {
    handleSendMessage(socket, data);
  });

  // Delete message from group chat
  socket.on(EVENTS.GROUP_CHAT.MESSAGE_DELETED, async (data) => {
    handleDeleteMessage(socket, data);
  });
  // Add member to group chat
  async function handleAddMember(socket, data) {
    const user_id = socket.user?.id;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chats)
        .where(and(eq(group_chats.id, group_id), eq(group_chats.group_admin, user_id)));

      if (!isAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)));

      if (isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.EXIST('Member'));
      }

      await db.insert(group_chat_members).values({ user_id: member_id, group_id, role: ENUM.RoleType.MEMBER });

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_ADDED, { member_id });
      ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, true, successMessage.ADDED('Member'));
    } catch (error) {
      ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, 'Failed to add member to group chat');
    }
  }

  // Remove member from group chat
  async function handleRemoveMember(socket, data) {
    const user_id = socket.user?.id;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chats)
        .where(and(eq(group_chats.id, group_id), eq(group_chats.group_admin, user_id)));

      if (!isAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)));

      if (!isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.NOT_EXIST('Member'));
      }

      const [deleteCount] = await db
        .delete(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)))
        .returning();

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_REMOVED, { member_id });
      ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, true, successMessage.REMOVED('Member'));
    } catch (error) {
      console.error(`Error removing member: ${error.message}`);
      ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, 'Failed to remove member from group chat');
    }
  }

  // Send message to group chat
  async function handleSendMessage(socket, data) {
    const user_id = socket.user?.id;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { group_id, message_content, message_type, media_url } = data;

    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, user_id)));

      if (!isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.UNAUTHORIZED_ACCESS);
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
        return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      // Emit the message to the entire group
      io.to(group_id).emit(EVENTS.GROUP_CHAT.RECEIVE_MESSAGE, result);
      ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, true, successMessage.ADDED('Message'), result);
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
      ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, 'Failed to send group message');
    }
  }

  // Delete message from group chat
  async function handleDeleteMessage(socket, data) {
    const user_id = socket.user?.id;
    const { group_id, message_id } = data;

    try {
      const [isSenderOrAdmin] = await db
        .select()
        .from(group_messages)
        .join(group_chat_members, eq(group_messages.group_id, group_chat_members.group_id))
        .where(
          and(
            eq(group_messages.id, message_id),
            eq(group_chat_members.group_id, group_id),
            eq(group_chat_members.user_id, user_id),
            or(eq(group_chat_members.role, ENUM.RoleType.ADMIN), eq(group_messages.sender_id, user_id))
          )
        );

      if (!isSenderOrAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.MESSAGE_DELETED, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const deleteCount = await db.delete(group_messages).where(eq(group_messages.id, message_id));

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.MESSAGE_DELETED, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MESSAGE_DELETED, { message_id });
      ioResponse(socket, EVENTS.GROUP_CHAT.MESSAGE_DELETED, true, successMessage.DELETED('Message'));
    } catch (error) {
      console.error(`Error deleting message: ${error.message}`);
      ioResponse(socket, EVENTS.GROUP_CHAT.MESSAGE_DELETED, false, 'Failed to delete group message');
    }
  }
};
