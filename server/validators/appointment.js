import { body, param, validationResult } from 'express-validator';

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const validateCreate = [
  body('patient').isMongoId().withMessage('Valid patient is required'),
  body('doctor').isMongoId().withMessage('Valid doctor is required'),
  body('date').isISO8601().withMessage('Valid date is required (ISO 8601)'),
  body('timeSlot.start').matches(/^\d{2}:\d{2}$/).withMessage('timeSlot.start must be in HH:MM format'),
  body('timeSlot.end').matches(/^\d{2}:\d{2}$/).withMessage('timeSlot.end must be in HH:MM format'),
  body('reason').optional().trim().escape(),
  handleErrors,
];

export const validateUpdate = [
  param('id').isMongoId().withMessage('Valid appointment ID is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required (ISO 8601)'),
  body('timeSlot.start').optional().matches(/^\d{2}:\d{2}$/).withMessage('timeSlot.start must be in HH:MM format'),
  body('timeSlot.end').optional().matches(/^\d{2}:\d{2}$/).withMessage('timeSlot.end must be in HH:MM format'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
  body('type').optional().isIn(['opd', 'follow-up', 'emergency']).withMessage('Invalid type'),
  body('reason').optional().trim().escape(),
  body('notes').optional().trim().escape(),
  handleErrors,
];
