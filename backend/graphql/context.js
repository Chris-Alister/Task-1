const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const getUser = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await Teacher.findById(decoded.userId);
      return user;
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return null;
    }
  }
  
  return null;
};

module.exports = { getUser };
