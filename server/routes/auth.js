import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  googleLogin,
  getGoogleAuthUrl,
  connectGoogle,
  disconnectGoogle,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators/auth.js';
import { validate } from '../validators/index.js';

const router = Router();

router.post('/register', authLimiter, protect, authorize('admin'), registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/google', googleLogin);
router.get('/google-auth-url', getGoogleAuthUrl);
router.post('/google/connect', protect, connectGoogle);
router.post('/google/disconnect', protect, disconnectGoogle);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, resetPassword);

export default router;
