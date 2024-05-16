import express from 'express';

import {
  login,
  register,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
  profile,
  updateProfile
  // addMember
} from '../controllers/user.controller';

import { staticTokenAuth, authenticateUser } from '../middlewares/authenticate-user';
import { validation } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../model/validation.schema';

const router = express.Router();
// auth start
router.post('/register', validation(registerSchema), staticTokenAuth, register);
router.post('/login', validation(loginSchema), staticTokenAuth, login);
router.post('/verify', staticTokenAuth, verifyOtp);
router.post('/forgotPassword', staticTokenAuth, forgotPassword);
router.post('/resetPassword/:token', staticTokenAuth, resetPassword);
router.get('/profile', authenticateUser, profile);
router.patch('/Profile', authenticateUser, updateProfile);
router.get('/logout', authenticateUser, logout);

export default router;
