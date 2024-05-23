import express from 'express';
import { seedAdmins } from '../utils/seeder';
import { getAllUsers, getGroupDetails, login } from '../controllers/admin.panel.controller';
import { isAdmin } from '../middlewares/authenticate-user';
const router = express.Router();
router.post('/seed/:number', seedAdmins);
router.post('/login', login);
router.get('/users', isAdmin, getAllUsers);
router.get('/users/:groupId', isAdmin, getGroupDetails);
export default router;
