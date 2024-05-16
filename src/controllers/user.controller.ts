import { Request, Response } from 'express';
import db from '../config/db.config';
import { eq, and, isNull } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { errorMessage, successMessage } from '../config/constant.config';
import response from '../utils/response';
import { users, iUser, otp } from '../model/schema';
import { env } from '../config/env.config';

interface DecodedUser {
  id: string;
  email: string;
  name: string;
  user_id: string;
  otp: number;
}

export async function register(req: Request, res: Response) {
  try {
    const { username, phone_number, email, password } = req.body;
    const [existingObj] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deleted_at)));

    if (existingObj) {
      return response.isDuplicate({ message: errorMessage.EXIST('User'), data: {} }, res);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const obj: iUser = {
      username: username,
      phone_number: phone_number,
      email: email,
      password: hashedPassword,
      created_device_ip: req.ip
    };

    const [result] = await db.insert(users).values(obj).returning({
      id: users.id,
      username: users.username,
      phone_number: users.phone_number,
      email: users.email,
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
        username: users.username,
        phone_number: users.phone_number,
        email: users.email,
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
        username: users.username,
        phone_number: users.phone_number,
        email: users.email,
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
    const { username, phone_number, email } = req.body;

    const [existingObj] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!existingObj) return response.failureResponse({ message: errorMessage.NOT_FOUND('User'), data: {} }, res);

    const obj = {
      username,
      phone_number,
      email,
      updated_at: new Date(),
      updated_device_ip: req.ip
    };
    const [result] = await db.update(users).set(obj).where(eq(users.id, req.user.id)).returning({
      id: users.id,
      username: users.username,
      phone_number: users.phone_number,
      email: users.email,
      updated_at: users.updated_at
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
