import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { admins, users } from '../model/schema';
import response from '../utils/response';
import { errorMessage } from '../config/constant.config';
import { env } from '../config/env.config';
import db from '../config/db.config';
import { eq } from 'drizzle-orm';

declare module 'express-serve-static-core' {
  interface Request {
    user: { id: string; email: string; name: string; user_id: string };
    admin: { id: string; email: string; name: string; role: string };
  }
}
declare module 'socket.io' {
  interface Socket {
    user: { id: string; email: string; name: string; user_id: string };
    admin: { id: string; email: string; name: string; role: string };
  }
}
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      response.validationError({ message: errorMessage.MISSING_TOKEN, data: {} }, res);
    } else {
      const verifyToken = token.split(' ')[1];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jwt.verify(verifyToken, env.SECRET_KEY, (err: any, decodedToken: any) => {
        if (err) {
          response.validationError({ message: errorMessage.INVALID_TOKEN, data: {} }, res);
        } else {
          req.user = decodedToken;
          next();
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const staticTokenAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      response.validationError({ message: errorMessage.MISSING_TOKEN, data: {} }, res);
    } else {
      const verifyToken = token.split(' ')[1];
      if (env.STATIC_TOKEN === verifyToken) {
        next();
      } else {
        response.validationError({ message: errorMessage.INVALID_TOKEN, data: {} }, res);
      }
    }
  } catch (error) {
    next(error);
  }
};

export const socketAuthenticator = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.headers['authorization'];
    if (!token) {
      return next(new Error('Please login to access this route'));
    }

    const decodedData = jwt.verify(token, env.SECRET_KEY as string) as { id: string; role: string };
    if (decodedData.role === 'admin') {
      const [admin] = await db.select().from(admins).where(eq(admins.id, decodedData.id));
      if (!admin) {
        return next(new Error('Please login to access this route'));
      }
      socket.admin = admin;
      next();
    } else {
      const [user] = await db.select().from(users).where(eq(users.id, decodedData.id));
      if (!user) {
        return next(new Error('Please login to access this route'));
      }

      socket.user = user;
      next();
    }
  } catch (error) {
    console.error(error);
    return next(new Error('Please login to access this route'));
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      response.validationError({ message: errorMessage.MISSING_TOKEN, data: {} }, res);
    } else {
      const verifyToken = token.split(' ')[1];

      const decodedData = jwt.verify(verifyToken, env.SECRET_KEY as string) as {
        id: string;
        email: string;
        role: string;
      };
      const [admin] = await db.select().from(admins).where(eq(admins.id, decodedData.id));
      if (!admin) {
        return next(new Error('Please login to access this route'));
      }

      req.admin = admin;
      next();
    }
  } catch (error) {
    next(error);
  }
};
