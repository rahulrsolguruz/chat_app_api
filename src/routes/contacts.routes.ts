import express from 'express';

import { authenticateUser } from '../middlewares/authenticate-user';
import {
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
  searchContacts
} from '../controllers/contacts.controller';
const router = express.Router();
router.get('/', authenticateUser, getAllContacts);
router.post('/', authenticateUser, createContact);
router.get('/:contact_id', authenticateUser, getContactById);
router.patch('/:groupId', authenticateUser, updateContact);
router.delete('/:contactId', authenticateUser, deleteContact);
router.get('/search/', authenticateUser, searchContacts);
export default router;
