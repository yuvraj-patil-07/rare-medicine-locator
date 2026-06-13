const ApiResponse = require('../utils/apiResponse');
const { validateObjectId } = require('../utils/validators');

/**
 * Validate request body fields
 */
const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
        if (rule.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        }
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }
        if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
          errors.push(`${field} must not exceed ${rule.max}`);
        }
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return ApiResponse.error(res, 'Validation failed', 400, errors);
    }

    next();
  };
};

/**
 * Validate MongoDB ObjectId in params
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    if (!validateObjectId(req.params[paramName])) {
      return ApiResponse.error(res, `Invalid ${paramName} format`, 400);
    }
    next();
  };
};

module.exports = { validate, validateId };
