import { Request, Response } from 'express';
import db from '../config/db.config';
import { successMessage, errorMessage } from '../config/constant.config';
import { settings } from '../model/schema';
import response from '../utils/response';
import { eq } from 'drizzle-orm';

export async function updatePrivacySettings(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const { profilePictureVisibility, statusVisibility, lastSeenVisibility } = req.body;

    // Update the user's privacy settings in the database
    const [updateCount] = await db
      .update(settings)
      .set({
        setting_value: JSON.stringify({ profilePictureVisibility, statusVisibility, lastSeenVisibility }),
        updated_at: new Date()
      })
      .where(eq(settings.user_id, userId))
      .andWhere(eq(settings.setting_name, 'privacy'))
      .returning('*');

    if (!updateCount) {
      return response.failureResponse({ message: errorMessage.NOT_FOUND('Settings'), data: {} }, res);
    }

    return response.successResponse({ message: successMessage.UPDATED('Privacy Settings'), data: updateCount }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'settings.controller', 'updatePrivacySettings');
  }
}
