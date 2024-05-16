import { Request } from 'express';
import { constant } from './default.constant';

export async function getLimitAndOffset(req: Request) {
  try {
    const offset = parseInt(req.query.offset as string) || constant.offset;
    const limit = parseInt(req.query.limit as string) || constant.limit;
    return [limit, offset];
  } catch (error) {
    return [constant.limit, constant.offset];
  }
}
