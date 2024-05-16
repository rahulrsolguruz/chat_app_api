/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import db from '../config/db.config';
import { eq, and, isNull, or, sql } from 'drizzle-orm';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { errorMessage, successMessage } from '../config/constant.config';
import response from '../utils/response';
import { users, iUser, otp, requests, chats } from '../model/schema';
import { env } from '../config/env.config';
import { emitEvent } from '../utils/common.functions';
import { ALERT, NEW_REQUEST, REFETCH_CHATS } from '../utils/events';

export async function createGroup(req: Request, res: Response) {
  try {
    const { groupName, memberIds } = req.body;
    const creator_id = req.user.id;
    // Prepare the object for insertion
    const groupData = {
      name: groupName,
      group_chat: true,
      creator_id: creator_id,
      members: memberIds.concat(creator_id)
    };

    // Insert the new group into the database
    const [newGroup] = await db.insert(chats).values(groupData).returning({
      group_id: chats.id,
      group_name: chats.name,
      group_members: chats.members,
      creator_id: chats.creator_id,
      created_at: chats.created_at
    });

    // Check if the insertion was successful
    if (!newGroup) {
      return res.status(500).json({ message: 'Failed to create the group' });
    }
    emitEvent(req, ALERT, newGroup.members, `Welcome to group`);
    emitEvent(req, REFETCH_CHATS, newGroup.members);
    return res.status(200).json({ message: 'Group created successfully', data: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserGroups(req: Request, res: Response) {
  try {
    const userId = req.user.id; // Assuming req.user.id is available
    const userGroups = await db.execute(sql`SELECT * FROM chats WHERE members @> ${sql.raw(`'["${userId}"]'::jsonb`)}`);
    response.successResponse({ message: 'User groups retrieved successfully', data: userGroups }, res);
    // return res.status(200).json({ message: 'User groups retrieved successfully', data: userGroups });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
export async function getGroupDetails(req: Request, res: Response) {
  try {
    const { group_id } = req.params;

    const groupDetails = await db.select().from(chats).where(eq(chats.id, group_id)).execute();

    if (!groupDetails.length) {
      return res.status(404).json({ message: 'Group not found' });
    }
    response.successResponse({ message: 'Group details retrieved successfully', data: groupDetails }, res);
  } catch (error) {
    console.error('Error fetching group details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// export async function updateGroup(req: Request, res: Response) {
//   try {
//     const { groupId } = req.params;
//     const { groupName, memberIds } = req.body;

//     const updatedData: any = {};
//     if (groupName) updatedData.name = groupName;
//     if (memberIds) updatedData.members = memberIds.concat(req.user.id); // Ensure creator is still a member

//     const [updatedGroup] = await db.update(chats).set(updatedData).where(eq(chats.id, groupId)).returning('*');

//     if (!updatedGroup) {
//       return res.status(404).json({ message: 'Group not found or update failed' });
//     }

//     return res.status(200).json({ message: 'Group updated successfully', data: updatedGroup });
//   } catch (error) {
//     console.error('Error updating group:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

export async function deleteGroup(req: Request, res: Response) {
  try {
    const { groupId } = req.params;

    const deletedGroup = await db.delete(chats).where(eq(chats.id, groupId)).returning('*');

    if (!deletedGroup.length) {
      return res.status(404).json({ message: 'Group not found or delete failed' });
    }

    return res.status(200).json({ message: 'Group deleted successfully', data: deletedGroup[0] });
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function addGroupMembers(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    const [group] = await db.select().from(chats).where(eq(chats.id, groupId)).execute();

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const updatedMembers = Array.from(new Set([...group.members, ...memberIds]));

    const [updatedGroup] = await db
      .update(chats)
      .set({ members: updatedMembers })
      .where(eq(chats.id, groupId))
      .returning('*');

    return res.status(200).json({ message: 'Members added successfully', data: updatedGroup });
  } catch (error) {
    console.error('Error adding members to group:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removeGroupMembers(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    const [group] = await db.select().from(chats).where(eq(chats.id, groupId)).execute();

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const updatedMembers = group.members.filter((member: string) => !memberIds.includes(member));

    const [updatedGroup] = await db
      .update(chats)
      .set({ members: updatedMembers })
      .where(eq(chats.id, groupId))
      .returning('*');

    return res.status(200).json({ message: 'Members removed successfully', data: updatedGroup });
  } catch (error) {
    console.error('Error removing members from group:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
export async function leaveGroup(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id; // Assuming req.user.id is the ID of the user making the request

    // Fetch the group
    const [group] = await db.select().from(chats).where(eq(chats.id, groupId)).execute();

    if (!group) {
      return response.failureResponse({ message: 'Group not found', data: {} }, res);
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return response.failureResponse({ message: 'User is not a member of this group', data: {} }, res);
    }

    // Remove the user from the group's members list
    const updatedMembers = group.members.filter((member: string) => member !== userId);

    // If there are no members left, you might want to delete the group or handle it differently
    if (updatedMembers.length === 0) {
      await db.delete(chats).where(eq(chats.id, groupId)).execute();
      return response.successResponse({ message: 'Group deleted as no members are left', data: {} }, res);
    } else {
      // Update the group with the new members list
      const [updatedGroup] = await db
        .update(chats)
        .set({ members: updatedMembers })
        .where(eq(chats.id, groupId))
        .returning('*');

      return response.successResponse({ message: 'User left the group successfully', data: updatedGroup }, res);
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    return response.failureResponse({ message: 'Internal server error', data: error }, res);
  }
}
