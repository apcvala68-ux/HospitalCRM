import { body } from 'express-validator';

export const createPatientValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .trim(),
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),
  body('gender')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Invalid email format'),
  body('bloodGroup')
    .optional({ values: 'falsy' })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
];

export const updatePatientValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty().withMessage('Last name cannot be empty'),
  body('dob')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone')
    .optional()
    .isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Invalid email format'),
  body('bloodGroup')
    .optional({ values: 'falsy' })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
];
