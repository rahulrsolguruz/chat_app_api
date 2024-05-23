import express from 'express';
import {
  createGroupChat,
  updateGroupChat,
  deleteGroupChat,
  searchGroups,
  addMemberToGroupChat,
  removeMemberFromGroupChat,
  getGroupChatMembers,
  sendGroupMessage,
  getGroupMessages,
  deleteGroupMessage
} from '../controllers/group.chat.controller'; // Update with the correct path to your controller file
import { authenticateUser } from '../middlewares/authenticate-user';

const router = express.Router();

// Group chat routes
router.post('/', authenticateUser, createGroupChat);
router.put('/:group_id', updateGroupChat);
router.delete('/:group_id', deleteGroupChat);

// Group chat member routes
router.post('/:group_id/members', addMemberToGroupChat);
router.delete('/:group_id/members/:user_id', removeMemberFromGroupChat);
router.get('/:id/members', getGroupChatMembers);

// Group message routes
router.post('/:group_id/messages', sendGroupMessage);
router.get('/:group_id/messages', getGroupMessages);
router.delete('/:group_id/messages/:message_id', deleteGroupMessage);

// Search groups route
router.get('/search', searchGroups);

export default router;
