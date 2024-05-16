import { Request, Response } from 'express';
import db from '../config/db.config';
import { successMessage, errorMessage } from '../config/constant.config';
import { contacts, users } from '../model/schema'; // Assuming contacts schema is imported
import response from '../utils/response';
import { and, eq, isNull, like, or } from 'drizzle-orm';

export async function createContact(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const { username } = req.body;
    const [user] = await db
      .select({
        contact_id: users.id
      })
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deleted_at)));
    if (!user) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('User'), data: {} }, res);
    }
    const newContact = {
      user_id,
      contact_id: user.contact_id
    };

    const [result] = await db.insert(contacts).values(newContact).returning({
      contact_id: contacts.contact_id
    });

    if (!result) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: result }, res);
    }

    return response.successResponse({ message: successMessage.ADDED('Contact'), data: result }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'createContact');
  }
}
export async function getContactById(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const contact_id = req.params.contact_id;
    const [contact] = await db
      .select({
        contact_id: contacts.contact_id,
        username: users.username,
        email: users.email
      })
      .from(contacts)
      .join(users, eq(contacts.contact_id, users.id))
      .where(and(eq(contacts.user_id, user_id), eq(contacts.contact_id, contact_id)));

    if (!contact) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Contact'), data: {} }, res);
    }
    return response.successResponse({ message: successMessage.FETCHED('Contact'), data: contact }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'getContactById');
  }
}
export async function getAllContacts(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalContactsResult = await db
      .select(db.raw('COUNT(*) AS count'))
      .from(contacts)
      .where(eq(contacts.user_id, user_id))
      .first();

    const totalContacts = totalContactsResult ? totalContactsResult.count : 0;

    const contactList = await db
      .select({
        contact_id: contacts.contact_id,
        username: users.username,
        email: users.email
      })
      .from(contacts)
      .join(users, eq(contacts.contact_id, users.id))
      .where(eq(contacts.user_id, user_id))
      .limit(limit)
      .offset(offset);

    const responseData = {
      message: successMessage.FETCHED('Contacts'),
      total: totalContacts,
      limit,
      skip: offset,
      data: contactList
    };
    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'getAllContacts');
  }
}
export async function updateContact(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const { contact_id, newUsername, newEmail } = req.body;

    const [contact] = await db
      .select({
        contact_id: contacts.contact_id
      })
      .from(contacts)
      .where(and(eq(contacts.user_id, user_id), eq(contacts.contact_id, contact_id)));

    if (!contact) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Contact'), data: {} }, res);
    }

    // Update the contact's username and email
    const [updatedContact] = await db
      .update(users)
      .set({
        username: newUsername,
        email: newEmail
      })
      .where(eq(users.id, contact_id))
      .returning({
        contact_id: users.id,
        username: users.username,
        email: users.email
      });

    if (!updatedContact) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: updatedContact }, res);
    }

    return response.successResponse({ message: successMessage.UPDATED('Contact'), data: updatedContact }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'updateContact');
  }
}
export async function deleteContact(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const { contact_id } = req.params;

    // Check if the contact exists for the user
    const [contact] = await db
      .select({
        contact_id: contacts.contact_id
      })
      .from(contacts)
      .where(and(eq(contacts.user_id, user_id), eq(contacts.contact_id, contact_id)));

    if (!contact) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Contact'), data: {} }, res);
    }

    // Delete the contact
    const [deleteCount] = await db
      .update(contacts)
      .set({ deleted_at: new Date() })
      .where(eq(contacts.contact_id, contact_id));

    if (!deleteCount) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }

    return response.successResponse({ message: successMessage.DELETED('Contact'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'deleteContact');
  }
}
export async function searchContacts(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const keyword: string = req.query.keyword as string;
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const offset: number = (page - 1) * limit;

    // Search for contacts matching the keyword
    const contactList = await db
      .select({
        contact_id: contacts.contact_id,
        username: users.username,
        email: users.email
      })
      .from(contacts)
      .join(users, eq(contacts.contact_id, users.id))
      .where(
        and(eq(contacts.user_id, user_id), or(like(users.username, `%${keyword}%`), like(users.email, `%${keyword}%`)))
      )
      .limit(limit)
      .offset(offset);

    // Get the total count of contacts matching the keyword
    const totalContactsResult = await db
      .select(db.raw('COUNT(*) AS count'))
      .from(contacts)
      .join(users, eq(contacts.contact_id, users.id))
      .where(
        and(eq(contacts.user_id, user_id), or(like(users.username, `%${keyword}%`), like(users.email, `%${keyword}%`)))
      )
      .first();

    const totalContacts = totalContactsResult ? totalContactsResult.count : 0;

    const responseData = {
      message: successMessage.FETCHED('Contacts'),
      total: totalContacts,
      limit,
      skip: offset,
      data: contactList
    };

    return response.successResponseWithPagination(responseData, res);
  } catch (error) {
    return response.failureResponse(error, res, 'contact.controller', 'searchContacts');
  }
}
