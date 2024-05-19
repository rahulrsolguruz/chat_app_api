import { Router } from 'express';

import userRouter from './user.routes';
import MessageRouter from './messages.routes';
const router = Router();

router.use(`/user`, userRouter);
router.use(`/message`, MessageRouter);

export default router;
