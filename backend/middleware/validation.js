const { body, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Chat request validation
const validateChatRequest = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  handleValidationErrors
];

// Code execution validation
const validateCodeRequest = [
  body('code')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be between 1 and 10000 characters'),
  body('language')
    .trim()
    .isIn(['javascript', 'typescript', 'python', 'html', 'css', 'json', 'markdown'])
    .withMessage('Language must be one of: javascript, typescript, python, html, css, json, markdown'),
  body('input')
    .optional()
    .isString()
    .withMessage('Input must be a string'),
  handleValidationErrors
];

// Memory validation
const validateMemoryRequest = [
  body('role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be one of: user, assistant, system'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
  handleValidationErrors
];

// Conversation validation
const validateConversationRequest = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  handleValidationErrors
];

// Search validation
const validateSearchRequest = [
  body('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Search query must be between 1 and 500 characters'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
  body('role')
    .optional()
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be one of: user, assistant, system'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateChatRequest,
  validateCodeRequest,
  validateMemoryRequest,
  validateConversationRequest,
  validateSearchRequest,
  handleValidationErrors
};
