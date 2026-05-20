import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'doctor', 'receptionist', 'nurse', 'cashier', 'pharmacist'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .trim(),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const forgotPasswordValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
];

export const resetPasswordValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('code')
    .notEmpty().withMessage('Verification code is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const updateProfileValidation = [
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('shift').optional().isIn(['morning', 'evening', 'night', 'general']).withMessage('Invalid shift'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('address').optional().trim(),
  body('bio').optional().trim(),
  body('preferences.language').optional().isString(),
  body('preferences.emailNotifications').optional().isBoolean(),
];
