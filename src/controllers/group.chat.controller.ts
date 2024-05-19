import { Request, Response } from 'express';
import db from '../config/db.config';
import { successMessage, errorMessage } from '../config/constant.config';
import { group_chat_members, group_chats, group_messages, message_type_enum, users } from '../model/schema';
import response from '../utils/response';
import { and, eq, like, or } from 'drizzle-orm';
import ENUM from '../utils/enum';
export async function createGroupChat(req: Request, res: Response) {
  try {
    const group_admin = req.user.id;
    const { group_name, group_picture_url } = req.body;

    const newGroupChat = {
      group_admin,
      group_name,
      group_picture_url
    };

    const [result] = await db.insert(group_chats).values(newGroupChat).returning({
      group_id: group_chats.id
    });

    if (!result) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: result }, res);
    }

    return response.successResponse({ message: successMessage.ADDED('Group Chat'), data: result }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'createGroupChat');
  }
}

export async function updateGroupChat(req: Request, res: Response) {
  try {
    const group_admin = req.user.id;
    const { group_id, newGroupName, newGroupPictureUrl } = req.body;

    const [group] = await db
      .select({
        group_id: group_chats.id
      })
      .from(group_chats)
      .where(and(eq(group_chats.group_admin, group_admin), eq(group_chats.id, group_id)));

    if (!group) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Group Chat'), data: {} }, res);
    }

    const [updatedGroup] = await db
      .update(group_chats)
      .set({
        group_name: newGroupName,
        group_picture_url: newGroupPictureUrl
      })
      .where(eq(group_chats.id, group_id))
      .returning({
        group_id: group_chats.id,
        group_name: group_chats.group_name,
        group_picture_url: group_chats.group_picture_url
      });

    if (!updatedGroup) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: updatedGroup }, res);
    }

    return response.successResponse({ message: successMessage.UPDATED('Group Chat'), data: updatedGroup }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'updateGroupChat');
  }
}

export async function deleteGroupChat(req: Request, res: Response) {
  try {
    const group_admin = req.user.id;
    const { group_id } = req.params;

    const [group] = await db
      .select({
        group_id: group_chats.id
      })
      .from(group_chats)
      .where(and(eq(group_chats.group_admin, group_admin), eq(group_chats.id, group_id)));

    if (!group) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Group Chat'), data: {} }, res);
    }

    const [deleteCount] = await db
      .update(group_chats)
      .set({ deleted_at: new Date() })
      .where(eq(group_chats.id, group_id));

    if (!deleteCount) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }

    return response.successResponse({ message: successMessage.DELETED('Group Chat'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'deleteGroupChat');
  }
}

export async function searchGroups(req: Request, res: Response) {
  try {
    const keyword: string = req.query.keyword as string;
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const offset: number = (page - 1) * limit;

    const groupList = await db
      .select({
        group_id: group_chats.id,
        group_name: group_chats.group_name,
        group_picture_url: group_chats.group_picture_url
      })
      .from(group_chats)
      .where(or(like(group_chats.group_name, `%${keyword}%`), like(group_chats.group_picture_url, `%${keyword}%`)))
      .limit(limit)
      .offset(offset);

    const totalGroupsResult = await db
      .select(db.raw('COUNT(*) AS count'))
      .from(group_chats)
      .where(or(like(group_chats.group_name, `%${keyword}%`), like(group_chats.group_picture_url, `%${keyword}%`)))
      .first();

    const totalGroups = totalGroupsResult ? totalGroupsResult.count : 0;

    const responseData = {
      message: successMessage.FETCHED('Groups'),
      total: totalGroups,
      limit,
      skip: offset,
      data: groupList
    };

    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'searchGroups');
  }
}

export async function addMemberToGroupChat(req: Request, res: Response) {
  try {
    // Get authenticated user's ID
    const user_id = req.user.id;

    // Get group chat ID from request parameters
    const { id } = req.params;

    // Check if the user is the admin of the group chat
    const isAdmin = await db
      .select('user_id')
      .from(group_chat_members)
      .where(eq(group_chat_members.id, id))
      .andWhere(eq(group_chat_members.user_id, user_id))
      .andWhere(eq(group_chat_members.role, ENUM.RoleType.ADMIN))
      .first();

    if (!isAdmin) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    // Get the user ID to be added as a member from the request body
    const { member_id } = req.body;

    // Check if the user to be added is already a member of the group chat
    const [isMember] = await db
      .select('user_id')
      .from(group_chat_members)
      .where(eq(group_chat_members.id, id))
      .andWhere(eq(group_chat_members.user_id, member_id))
      .first();

    if (isMember) {
      return response.failureResponse({ message: errorMessage.EXIST('Member'), data: {} }, res);
    }

    // Add the user as a member to the group chat
    await db.insert(group_chat_members).values({
      user_id: member_id,
      group_id: id,
      role: ENUM.RoleType.MEMBER
    });

    return response.successResponse({ message: successMessage.ADDED('Member'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'addMemberToGroupChat');
  }
}
export async function removeMemberFromGroupChat(req: Request, res: Response) {
  try {
    // Get authenticated user's ID
    const admin_id = req.user.id;

    // Get group chat ID from request parameters
    const { user_id, group_id } = req.params;

    // Check if the user is the admin of the group chat
    const isAdmin = await db
      .select()
      .from(group_chat_members)
      .where(eq(group_chat_members.id, group_id))
      .andWhere(eq(group_chat_members.user_id, admin_id))
      .andWhere(eq(group_chat_members.role, ENUM.RoleType.ADMIN))
      .first();

    if (!isAdmin) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    const [deleteCount] = await db
      .delete()
      .from(group_chat_members)
      .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, user_id)));
    if (!deleteCount) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }
    return response.successResponse({ message: successMessage.REMOVED('Member'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'removeMemberFromGroupChat');
  }
}
export async function getGroupChatMembers(req: Request, res: Response) {
  try {
    // Get group chat ID from request parameters
    const group_id = req.params.id;

    // Retrieve the list of members in the group chat
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

    // Return the list of members as a success response
    return response.successResponse({ message: successMessage.FETCHED('Group Chat Members'), data: memberList }, res);
  } catch (error) {
    // Handle any errors and return a failure response
    return response.failureResponse(error, res, 'group.controller', 'getGroupChatMembers');
  }
}
export async function sendGroupMessage(req: Request, res: Response) {
  try {
    // Get authenticated user's ID
    const sender_id = req.user.id;

    // Get group chat ID from request parameters
    const { group_id } = req.params;

    // Get message content and type from request body
    const { message_content, message_type, media_url } = req.body;

    // Check if the sender is a member of the group chat
    const isMember = await db
      .select()
      .from(group_chat_members)
      .where(eq(group_chat_members.id, group_id))
      .andWhere(eq(group_chat_members.user_id, sender_id))
      .first();

    if (!isMember) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    // Create new message
    const newMessage = {
      sender_id,
      group_id: group_id,
      message_content,
      message_type: message_type_enum.enumValues[message_type],
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
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: result }, res);
    }

    return response.successResponse({ message: successMessage.ADDED('Message'), data: result }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'sendGroupMessage');
  }
}

export async function getGroupMessages(req: Request, res: Response) {
  try {
    // Get authenticated user's ID
    const user_id = req.user.id;

    // Get group chat ID from request parameters
    const { group_id } = req.params;

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if the user is a member of the group chat
    const isMember = await db
      .select()
      .from(group_chat_members)
      .where(eq(group_chat_members.id, group_id))
      .andWhere(eq(group_chat_members.user_id, user_id))
      .first();

    if (!isMember) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    // Get the total count of messages in the group chat
    const totalMessagesResult = await db
      .select(db.raw('COUNT(*) AS count'))
      .from(group_messages)
      .where(eq(group_messages.group_id, group_id))
      .first();

    const totalMessages = totalMessagesResult ? totalMessagesResult.count : 0;

    // Retrieve the messages from the group chat
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
      .orderBy(group_messages.time_stamp, 'asc'); // Order by timestamp ascending

    const responseData = {
      message: successMessage.FETCHED('Group Messages'),
      total: totalMessages,
      limit,
      skip: offset,
      data: messages
    };

    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'getGroupMessages');
  }
}
export async function deleteGroupMessage(req: Request, res: Response) {
  try {
    // Get authenticated user's ID
    const user_id = req.user.id;

    // Get group message ID from request parameters
    const { group_id, message_id } = req.params;

    // Check if the user is the sender of the message or the admin of the group chat
    const isSenderOrAdmin = await db
      .select()
      .from(group_messages)
      .join(group_chat_members, eq(group_messages.group_id, group_chat_members.id))
      .where(
        eq(group_messages.id, message_id),
        eq(group_chat_members.id, group_id),
        eq(group_chat_members.user_id, user_id),
        or(eq(group_chat_members.role, ENUM.RoleType.ADMIN), eq(group_messages.sender_id, user_id))
      )
      .first();

    if (!isSenderOrAdmin) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    // Delete the message
    const deleteCount = await db.delete(group_messages).where(eq(group_messages.id, message_id));

    if (!deleteCount) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }

    return response.successResponse({ message: successMessage.DELETED('Message'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'group.controller', 'deleteGroupMessage');
  }
}
