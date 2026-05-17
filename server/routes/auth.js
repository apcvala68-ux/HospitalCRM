import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, googleLogin, getGoogleAuthUrl } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google-auth-url', getGoogleAuthUrl);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
