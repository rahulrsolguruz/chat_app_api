import express from 'express';
import { authenticateUser } from '../middlewares/authenticate-user';
import { validation } from '../middlewares/validate';
import { newGroupSchema } from '../model/validation.schema';
import { createGroup, getUserGroups } from '../controllers/group.controller';

const router = express.Router();

router.post('/new-group', validation(newGroupSchema), authenticateUser, createGroup);
router.get('/get-group', authenticateUser, getUserGroups);
export default router;
