import express from 'express';
import { deleteMedia, uploadMedia } from '../controllers/media.controller';
import { upload } from '../utils/multer';
import { authenticateUser } from '../middlewares/authenticate-user';

const router = express.Router();

router.post('/', authenticateUser, upload.single('file'), uploadMedia);
router.delete('/media/:id', authenticateUser, deleteMedia);
export default router;
