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
import { NEW_REQUEST, REFETCH_CHATS } from '../utils/events';
interface DecodedUser {
  id: string;
  email: string;
  name: string;
  user_id: string;
  otp: number;
}

export async function register(req: Request, res: Response) {
  try {
    const { name, bio, email, password } = req.body;
    const [existingObj] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deleted_at)));

    if (existingObj) {
      return response.isDuplicate({ message: errorMessage.EXIST('User'), data: {} }, res);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const obj: iUser = {
      name: name,
      bio: bio,
      email: email,
      password: hashedPassword,
      avatar_public_id: 'test',
      avatar_url: 'google.com',
      created_device_ip: req.ip
    };

    const [result] = await db.insert(users).values(obj).returning({
      id: users.id,
      name: users.name,
      bio: users.bio,
      email: users.email,
      avatar_public_id: users.avatar_public_id,
      avatar_url: users.avatar_url,
      created_at: users.created_at
    });
    if (!result) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }
    return response.successResponse(
      {
        message: successMessage.REGISTER('User'),
        data: result
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'register');
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const [existingObj] = await db.select().from(users).where(eq(users.email, email));
    if (!existingObj) {
      return response.unAuthorizedRequest(res);
    }
    const passwordMatch = await bcrypt.compare(password, existingObj.password);
    if (!passwordMatch) {
      return response.failureResponse({ message: errorMessage.INVALID_CREDENTIALS, data: {} }, res);
    }
    if (process.env.NODE_ENV === 'development') {
      await db.delete(otp).where(eq(otp.email, email));
      await db
        .insert(otp)
        .values({ fk_user: existingObj.id, otp: 123456, email: existingObj.email, created_device_ip: req.ip });
      return response.successResponse(
        {
          message: successMessage.OTP_SEND,
          data: {}
        },
        res
      );
    }
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'login');
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { OTP, email } = req.body;

    const [existingObj] = await db.select().from(otp).where(eq(otp.email, email));
    if (OTP != existingObj.otp) {
      return response.failureResponse({ message: errorMessage.INVALID_OTP, data: {} }, res);
    }
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        bio: users.bio,
        email: users.email,
        avatar_public_id: users.avatar_public_id,
        avatar_url: users.avatar_url,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.email, existingObj.email));
    const token = jwt.sign({ id: result.id, email: result.email }, env.SECRET_KEY);

    return response.successResponse(
      {
        message: successMessage.LOGIN('User'),
        data: { ...result, token: token }
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'verifyOtp');
  }
}

export async function logout(req: Request, res: Response) {
  try {
    return response.successResponse(
      {
        message: successMessage.LOGOUT('User'),
        data: {}
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'logout');
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return response.failureResponse({ message: errorMessage.NOT_FOUND('User'), data: {} }, res);
    const token = jwt.sign({ user_id: user.id, email: user.email, otp: 123456 }, env.SECRET_KEY, {
      expiresIn: '1h'
    });
    return response.successResponse(
      {
        message: successMessage.RESET_PASSWORD_SUCCESS,
        data: token
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'forgotPassword');
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token) return response.validationError({ message: errorMessage.MISSING_TOKEN, data: {} }, res);
    const decodeduser: DecodedUser = jwt.verify(token, env.SECRET_KEY) as DecodedUser;
    const [userinfo] = await db.select().from(otp).where(eq(otp.email, decodeduser.email));
    if (userinfo.otp === decodeduser.otp) {
      req.user = decodeduser;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, req.user.user_id));
      return response.successResponse(
        {
          message: successMessage.RESET_PASSWORD_SUCCESS,
          data: {}
        },
        res
      );
    } else {
      response.failureResponse({ message: errorMessage.INVALID_OTP, data: {} }, res);
      return;
    }
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'resetPassword');
  }
}
export async function profile(req: Request, res: Response) {
  try {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        bio: users.bio,
        email: users.email,
        avatar_public_id: users.avatar_public_id,
        avatar_url: users.avatar_url,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.id, req.user.id));
    if (!result) return response.failureResponse({ message: errorMessage.NOT_FOUND('User'), data: {} }, res);
    return response.successResponse(
      {
        message: successMessage.FETCH('Account Profile'),
        data: result
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'profile');
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { first_name, last_name, contact } = req.body;

    const [existingObj] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!existingObj) return response.failureResponse({ message: errorMessage.NOT_FOUND('User'), data: {} }, res);

    const obj = {
      first_name,
      last_name,
      contact,
      updated_at: new Date(),
      updated_device_ip: req.ip
    };
    const [result] = await db.update(users).set(obj).where(eq(users.id, req.user.id)).returning({
      id: users.id,
      name: users.name,
      bio: users.bio,
      email: users.email,
      avatar_public_id: users.avatar_public_id,
      avatar_url: users.avatar_url,
      created_at: users.created_at
    });
    return response.successResponse(
      {
        message: successMessage.UPDATED('User'),
        data: result
      },
      res
    );
  } catch (error) {
    return response.failureResponse(error, res, 'user.controller', 'updateProfile');
  }
}

export async function sendFriendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { user_id } = req.body;
    const current_user_id = req.user.id;

    // Check if a request already exists between the users
    const [existingRequest] = await db
      .select()
      .from(requests)
      .where(
        or(
          and(eq(requests.sender_id, current_user_id), eq(requests.receiver_id, user_id)),
          and(eq(requests.sender_id, user_id), eq(requests.receiver_id, current_user_id))
        )
      );
    if (existingRequest) {
      return response.failureResponse({ message: errorMessage.EXIST('Request'), data: {} }, res);
    }

    // Create a new friend request
    const obj = {
      sender_id: current_user_id,
      receiver_id: user_id
    };
    const [result] = await db.insert(requests).values(obj).returning({
      id: requests.id,
      sender_id: requests.sender_id,
      receiver_id: requests.receiver_id,
      created_at: requests.created_at
    });

    // Emit a new request event
    emitEvent(req, NEW_REQUEST, [user_id]);

    return response.successResponse({ message: successMessage.SENT('Request'), data: result }, res);
  } catch (error) {
    next(error);
  }
}

export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const { request_id, accept } = req.body;

    const current_user_id = req.user.id; // Assuming req.user.id is available

    // Find the request by ID

    const [request] = await db
      .select({
        sender_id: requests.sender_id,
        receiver_id: requests.receiver_id,
        sender_name: sql<string>`(SELECT name FROM users WHERE users.id = requests.sender_id)`.as('senderName'),
        receiver_name: sql<string>`(SELECT name FROM users WHERE users.id = requests.receiver_id)`.as('receiverName')
      })
      .from(requests)
      .where(eq(requests.id, request_id))
      .execute();

    if (!request) {
      return response.failureResponse({ message: errorMessage.NOT_FOUND('Request'), data: {} }, res);
    }

    const { sender_id, receiver_id, sender_name, receiver_name } = request;

    if (receiver_id !== current_user_id) {
      return response.unAuthorizedRequest(req);
    }

    if (!accept) {
      // Reject the request
      await db.delete(requests).where(eq(requests.id, request_id));
      return response.successResponse({ message: successMessage.REQ_REJECTED, data: {} }, res);
    }

    // Create a new chat
    const newChat = await db
      .insert(chats)
      .values({
        name: `${sender_name}-${receiver_name}`
      })
      .execute();

    const chat_Id = newChat.id;

    // Add members to the new chat
    const members = [sender_id, receiver_id];
    const memberInserts = members.map((user_id) => ({
      chat_Id,
      user_id
    }));

    await db.insert(chats).values(memberInserts);

    await db.delete(requests).where(eq(requests.id, request_id));

    // Emit the REFETCH_CHATS event
    emitEvent(req, REFETCH_CHATS, members);
    return response.successResponse({ message: successMessage.REQ_ACCEPTED, data: { sender_id: sender_id } }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'chat.controller', 'acceptFriendRequest');
  }
}

export async function getUserChats(req: Request, res: Response) {
  try {
    const userId = req.user.id; // Assuming req.user.id is available

    // Fetch chats where the user is a member
    const userChats = await db.execute(sql`SELECT * FROM chats WHERE ${sql.raw(userId)} = ANY(members)`);
    return res.status(200).json({ message: 'User chats retrieved successfully', data: userChats });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
