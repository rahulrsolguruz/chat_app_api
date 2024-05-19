import express from 'express';
import { sendMessage } from '../controllers/one-to-one-chat.controller';
import { authenticateUser } from '../middlewares/authenticate-user';

const router = express.Router();

router.post('/send', authenticateUser, sendMessage);

export default router;
