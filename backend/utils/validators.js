const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  return /^[+]?[\d\s-]{10,15}$/.test(phone);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateCoordinates = (lng, lat) => {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(validator.trim(str));
};

const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCoordinates,
  sanitizeInput,
  validateObjectId,
};
