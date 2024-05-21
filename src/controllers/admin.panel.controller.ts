import { Request, Response } from 'express';
import db from '../config/db.config';
import { users, group_chats, group_chat_members, reported_messages, messages } from '../model/schema';
import { count, isNull, asc, eq, desc } from 'drizzle-orm';
import response from '../utils/response';
import { successMessage } from '../config/constant.config';
import ENUM from '../utils/enum';

// User Management
export async function getAllUsers(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const [countResult] = await db.select({ count: count() }).from(users).where(isNull(users.deleted_at));
    const totalCount = countResult.count;

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        phone_number: users.phone_number,
        email: users.email,
        profile_picture_url: users.profile_picture_url,
        status_message: users.status_message,
        last_seen: users.last_seen,
        status: users.status,
        created_at: users.created_at,
        updated_at: users.updated_at
      })
      .from(users)
      .where(isNull(users.deleted_at))
      .orderBy(asc(users.created_at))
      .limit(limit)
      .offset(offset);

    const responseData = {
      message: 'Users fetched successfully',
      total: totalCount,
      limit: limit,
      skip: offset,
      data: result
    };

    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'getAllUsers');
  }
}

export async function getUserDetails(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        phone_number: users.phone_number,
        email: users.email,
        profile_picture_url: users.profile_picture_url,
        status_message: users.status_message,
        last_seen: users.last_seen,
        status: users.status,
        created_at: users.created_at,
        updated_at: users.updated_at
      })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const responseData = {
      message: 'User details fetched successfully',
      data: user[0]
    };

    return response.successResponse(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'getUserDetails');
  }
}
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db.update(users).set({ deleted_at: new Date() }).where(eq(users.id, userId));

    return response.successResponse(
      {
        message: successMessage.DELETED('User'),
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'deleteUser');
  }
}
export async function banUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    // Check if the user exists and is not already banned
    const [existingUser] = await db
      .select({
        id: users.id,
        status: users.status
      })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (existingUser.status === ENUM.UserStatus.BANNED) {
      return res.status(400).json({
        success: false,
        message: 'User is already banned'
      });
    }

    // Update the user's status to banned
    await db.update(users).set({ status: ENUM.UserStatus.BANNED }).where(eq(users.id, userId));
    return response.successResponse(
      {
        message: 'User banned successfully',
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'banUser');
  }
}
export async function unBanUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    // Check if the user exists and is not already banned
    const [existingUser] = await db
      .select({
        id: users.id,
        status: users.status
      })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (existingUser.status === ENUM.UserStatus.UNBANNED) {
      return res.status(400).json({
        success: false,
        message: 'User is already banned'
      });
    }

    // Update the user's status to banned
    await db.update(users).set({ status: ENUM.UserStatus.UNBANNED }).where(eq(users.id, userId));
    return response.successResponse(
      {
        message: 'User banned successfully',
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'banUser');
  }
}
// Group Management
export async function getAllGroups(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const [countResult] = await db.select({ count: count() }).from(group_chats).where(isNull(group_chats.deleted_at));
    const totalCount = countResult.count;

    const result = await db
      .select({
        id: group_chats.id,
        name: group_chats.group_name,
        picture_url: group_chats.group_picture_url,
        created_at: group_chats.created_at,
        updated_at: group_chats.updated_at
      })
      .from(group_chats)
      .where(isNull(group_chats.deleted_at))
      .orderBy(asc(group_chats.created_at))
      .limit(limit)
      .offset(offset);

    const responseData = {
      success: true,
      message: successMessage.ALL_FETCH('Groups'),
      total: totalCount,
      limit: limit,
      skip: offset,
      data: result
    };

    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'getAllGroups');
  }
}
export async function getGroupDetails(req: Request, res: Response) {
  try {
    const groupId = req.params.groupId;

    const [group] = await db
      .select({
        id: group_chats.id,
        name: group_chats.group_name,
        picture_url: group_chats.group_picture_url,
        created_at: group_chats.created_at,
        updated_at: group_chats.updated_at
      })
      .from(group_chats)
      .where(eq(group_chats.id, groupId))
      .andWhere(isNull(group_chats.deleted_at))
      .limit(1);

    if (group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const responseData = {
      success: true,
      message: 'Group details fetched successfully',
      data: group
    };

    return response.successResponse(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'getGroupDetails');
  }
}
export async function updateGroupDetails(req: Request, res: Response) {
  try {
    const groupId = req.params.groupId;
    const { group_name, group_picture_url } = req.body;

    // Check if the group exists
    const [existingGroup] = await db
      .select({
        id: group_chats.id
      })
      .from(group_chats)
      .where(eq(group_chats.id, groupId))
      .andWhere(isNull(group_chats.deleted_at))
      .limit(1);

    if (existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Update the group details
    await db
      .update(group_chats)
      .set({
        group_name: group_name || existingGroup.group_name,
        group_picture_url: group_picture_url || existingGroup.group_picture_url,
        updated_at: new Date()
      })
      .where(eq(group_chats.id, groupId));

    const responseData = {
      success: true,
      message: successMessage.UPDATED('Group'),
      data: {}
    };

    return response.successResponse(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'updateGroupDetails');
  }
}
export async function deleteGroup(req: Request, res: Response) {
  try {
    const groupId = req.params.groupId;

    // Check if the group exists
    const [existingGroup] = await db
      .select({ id: group_chats.id })
      .from(group_chats)
      .where(eq(group_chats.id, groupId))
      .andWhere(isNull(group_chats.deleted_at))
      .limit(1);

    if (existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    await db.update(group_chats).set({ deleted_at: new Date() }).where(eq(group_chats.id, groupId));

    return response.successResponse(
      {
        message: successMessage.DELETED('Group'),
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'deleteGroup');
  }
}
export async function addMemberToGroup(req: Request, res: Response) {
  try {
    const groupId = req.params.groupId;
    const { userId } = req.body;

    // Check if the group exists and is not deleted
    const [existingGroup] = await db
      .select({ id: group_chats.id })
      .from(group_chats)
      .where(eq(group_chats.id, groupId))
      .andWhere(isNull(group_chats.deleted_at))
      .limit(1);

    if (existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if the user exists and is not deleted
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is already a member of the group
    const [existingMember] = await db
      .select({ id: group_chat_members.id })
      .from(group_chat_members)
      .where(eq(group_chat_members.group_id, groupId))
      .andWhere(eq(group_chat_members.user_id, userId))
      .limit(1);

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of the group'
      });
    }

    // Add the user to the group
    await db.insert(group_chat_members).values({
      group_id: groupId,
      user_id: userId,
      role: ENUM.RoleType.MEMBER,
      joined_at: new Date()
    });

    return response.successResponse(
      {
        message: successMessage.ADDED('User to Group'),
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'addMemberToGroup');
  }
}
export async function removeMemberFromGroup(req: Request, res: Response) {
  try {
    const { groupId, userId } = req.params;

    // Check if the group exists and is not deleted
    const [existingGroup] = await db
      .select({ id: group_chats.id })
      .from(group_chats)
      .where(eq(group_chats.id, groupId))
      .andWhere(isNull(group_chats.deleted_at))
      .limit(1);

    if (existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if the user exists and is not deleted
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is a member of the group
    const [existingMember] = await db
      .select({ id: group_chat_members.id })
      .from(group_chat_members)
      .where(eq(group_chat_members.group_id, groupId))
      .andWhere(eq(group_chat_members.user_id, userId))
      .limit(1);

    if (existingMember) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of the group'
      });
    }

    // Remove the user from the group
    await db
      .delete(group_chat_members)
      .where(eq(group_chat_members.group_id, groupId))
      .andWhere(eq(group_chat_members.user_id, userId));

    return response.successResponse(
      {
        message: successMessage.DELETED('User from Group'),
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'removeMemberFromGroup');
  }
}
//  Content Moderation
export async function addReportedMessage(req: Request, res: Response) {
  try {
    const { messageId, reportedBy, reason } = req.body;

    // Validate required fields
    if (!messageId || !reportedBy || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Message ID, reported by, and reason are required'
      });
    }

    // Create a new reported message
    const newReportedMessage = {
      message_id: messageId,
      reported_by: reportedBy,
      reason: reason,
      status: ENUM.messagesStatus.PENDING,
      created_device_ip: req.ip
    };

    await db.insert(reported_messages).values(newReportedMessage);

    return response.successResponse(
      {
        message: 'Message reported successfully',
        data: newReportedMessage
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'addReportedMessage');
  }
}

export async function getReportedMessages(req: Request, res: Response) {
  try {
    const reportedMessages = await db
      .select({
        reported_message_id: reported_messages.id,
        message_id: reported_messages.message_id,
        reported_by: reported_messages.reported_by,
        reason: reported_messages.reason,
        status: reported_messages.status,
        message_content: messages.message_content,
        reported_user_username: users.username
      })
      .from(reported_messages)
      .join(messages)
      .on(eq(reported_messages.message_id, messages.id))
      .join(users)
      .on(eq(reported_messages.reported_by, users.id))
      .where(isNull(reported_messages.deleted_at))
      .orderBy(desc(reported_messages.created_at));
    return response.successResponse(
      {
        message: successMessage.ALL_FETCH('reported messages'),
        data: reportedMessages
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'getReportedMessages');
  }
}
export async function deleteReportedMessage(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    // Validate if the messageId is provided
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }

    // Check if the message exists and is not deleted
    const [existingMessage] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.id, messageId))
      .andWhere(isNull(messages.deleted_at))
      .limit(1);

    if (existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await db.update(messages).set({ deleted_at: new Date() }).where(eq(messages.id, messageId));

    await db
      .update(reported_messages)
      .set({ status: ENUM.messagesStatus.RESOLVED })
      .where(eq(reported_messages.message_id, messageId));

    return response.successResponse(
      {
        message: 'Message deleted successfully',
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'deleteReportedMessage');
  }
}
export async function flagMessageAsInappropriate(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { reportedBy, reason } = req.body;

    // Validate if the messageId, reportedBy, and reason are provided
    if (!messageId || !reportedBy || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Message ID, reported by user ID, and reason are required'
      });
    }

    // Check if the message exists and is not deleted
    const existingMessage = await db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.id, messageId))
      .andWhere(isNull(messages.deleted_at))
      .limit(1);

    if (existingMessage.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if the reporting user exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, reportedBy))
      .andWhere(isNull(users.deleted_at))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporting user not found'
      });
    }

    // Insert the reported message into the reported_messages table
    await db.insert(reported_messages).values({
      message_id: messageId,
      reported_by: reportedBy,
      reason: reason,
      status: ENUM.messagesStatus.DISMISSED,
      created_at: new Date(),
      updated_at: new Date()
    });

    return response.successResponse(
      {
        message: 'Message flagged as inappropriate successfully',
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'admin.controller', 'flagMessageAsInappropriate');
  }
}
