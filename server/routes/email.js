import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getEmails,
  getEmail,
  getAttachment,
  sendEmail,
  markAsRead,
  getLabels,
  getProfile,
} from '../controllers/emailController.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.get('/labels', getLabels);
router.get('/', getEmails);
router.get('/:id', getEmail);
router.get('/:messageId/attachments/:attachmentId', getAttachment);
router.post('/send', sendEmail);
router.post('/:id/read', markAsRead);

export default router;
