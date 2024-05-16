import { Request, Response } from 'express';
import db from '../config/db.config';
import { successMessage, errorMessage } from '../config/constant.config';
import { messages, message_status_enum } from '../model/schema'; // Assuming messages schema is imported
import response from '../utils/response';
import ENUM from '../utils/enum';
import { eq } from 'lodash';

export async function sendMessage(req: Request, res: Response) {
  try {
    const { receiver_id, message_content } = req.body;
    const sender_id = req.user.id;

    // Insert the message into the database
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

    if (!result) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }

    return response.successResponse({ message: successMessage.SENT('Message'), data: result }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'message.controller', 'sendMessage');
  }
}
export async function getMessages(req: Request, res: Response) {
  try {
    const { sender_id, receiver_id } = req.params;

    // Retrieve messages between the sender and receiver
    const messageList = await db
      .select()
      .from(messages)
      .where((builder) => {
        builder
          .where(messages.sender_id, sender_id)
          .andWhere(messages.receiver_id, receiver_id)
          .orWhere(messages.sender_id, receiver_id)
          .andWhere(messages.receiver_id, sender_id);
      })
      .orderBy('time_stamp', 'asc');

    if (!messageList) {
      return response.failureResponse({ message: errorMessage.NOT_FOUND('Messages'), data: {} }, res);
    }

    return response.successResponse({ message: successMessage.FETCHED('Messages'), data: messageList }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'message.controller', 'getMessages');
  }
}

export async function getUnreadMessages(req: Request, res: Response) {
  try {
    const user_id = req.user.id;

    // Retrieve unread messages for the authenticated user
    const unreadMessages = await db
      .select()
      .from(messages)
      .where({ receiver_id: user_id, status: ENUM.MessageStatus.UNREAD });

    return response.successResponse({ message: 'Unread Messages Retrieved Successfully', data: unreadMessages }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'message.controller', 'getUnreadMessages');
  }
}
export async function updateMessageStatus(req: Request, res: Response) {
  try {
    const message_id = req.params.id;
    const { status } = req.body;

    // Update the status of the message
    const updatedMessage = await db(messages)
      .update({ status: message_status_enum.enumValues[status] })
      .where(eq(messages.id, message_id));

    if (!updatedMessage) {
      return response.failureResponse({ message: 'Message not found or update failed', data: {} }, res);
    }

    return response.successResponse({ message: 'Message status updated successfully', data: updatedMessage }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'message.controller', 'updateMessageStatus');
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const message_id = req.params.id;

    // Delete the message from the database
    const deleteCount = await db(messages).delete().where(eq(messages.id, message_id));

    if (!deleteCount) {
      return response.failureResponse({ message: 'Message not found or delete failed', data: {} }, res);
    }

    return response.successResponse({ message: 'Message deleted successfully', data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'message.controller', 'deleteMessage');
  }
}
