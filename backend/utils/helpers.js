const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const generateStudentCode = (studentId, prefix = 'STU') => {
  return `${prefix}-${studentId.toString().slice(-8).toUpperCase()}`;
};

module.exports = { generateToken, getTodayDate, formatTime, generateStudentCode };
