import { Router } from 'express';

import userRouter from './user.routes';
import groupRouter from './group.routes';
const router = Router();

router.use(`/user`, userRouter);
router.use(`/group`, groupRouter);
export default router;
