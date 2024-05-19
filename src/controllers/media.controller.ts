import { Request, Response } from 'express';
import db from '../config/db.config';
import { successMessage, errorMessage } from '../config/constant.config';
import { media } from '../model/schema';
import response from '../utils/response';
import { cloudinary } from '../utils/cloudinary';
import { eq } from 'drizzle-orm';

export async function uploadMedia(req: Request, res: Response) {
  try {
    const uploader_id = req.user.id;
    const file = req.file;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto'
    });

    // Save media details in the database
    const newMedia = {
      uploader_id,
      file_type: result.resource_type,
      file_url: result.secure_url,
      uploaded_at: new Date()
    };

    const [savedMedia] = await db.insert(media).values(newMedia).returning('*');

    return response.successResponse({ message: successMessage.UPLOADED('Media'), data: savedMedia }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'media.controller', 'uploadMedia');
  }
}

export async function getMediaById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Retrieve media details from the database
    const [mediaDetails] = await db
      .select({
        id: media.id,
        uploader_id: media.uploader_id,
        file_type: media.file_type,
        file_url: media.file_url,
        uploaded_at: media.uploaded_at
      })
      .from(media)
      .where(eq(media.id, id))
      .andWhere(eq(media.deleted_at, null));

    if (!mediaDetails) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Media'), data: {} }, res);
    }

    return response.successResponse({ message: successMessage.FETCHED('Media'), data: mediaDetails }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'media.controller', 'getMediaById');
  }
}
export async function deleteMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if the media exists and if the authenticated user is the uploader
    const [mediaDetails] = await db
      .select({
        id: media.id,
        uploader_id: media.uploader_id
      })
      .from(media)
      .where(eq(media.id, id))
      .andWhere(eq(media.deleted_at, null));

    if (!mediaDetails) {
      return response.failureResponse({ message: errorMessage.NOT_EXIST('Media'), data: {} }, res);
    }

    if (mediaDetails.uploader_id !== user_id) {
      return response.failureResponse({ message: errorMessage.UNAUTHORIZED_ACCESS, data: {} }, res);
    }

    // Mark the media as deleted
    const [deleteResult] = await db
      .update(media)
      .set({ deleted_at: new Date() })
      .where(eq(media.id, id))
      .returning({ id: media.id });

    if (!deleteResult) {
      return response.failureResponse({ message: errorMessage.SOMETHING_WENT_WRONG, data: {} }, res);
    }

    return response.successResponse({ message: successMessage.DELETED('Media'), data: {} }, res);
  } catch (error) {
    return response.failureResponse(error, res, 'media.controller', 'deleteMedia');
  }
}
