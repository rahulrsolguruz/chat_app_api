import { Router } from 'express';

import userRouter from './user.routes';
import adminRouter from './admin.routes';
import groupRouter from './group.routes';
import mediaRouter from './media.routes';
import contactRouter from './contacts.routes';
const router = Router();

router.use(`/user`, userRouter);
router.use(`/admin`, adminRouter);
router.use(`/group`, groupRouter);
router.use(`/media`, mediaRouter);
router.use(`/contact`, contactRouter);
export default router;
