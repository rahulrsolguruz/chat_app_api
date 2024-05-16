import express from 'express';
import { uploadMedia } from '../controllers/media.controller';
import { upload } from '../utils/multer';
upload;

const router = express.Router();

router.post('/media', upload.single('file'), uploadMedia);

export default router;
