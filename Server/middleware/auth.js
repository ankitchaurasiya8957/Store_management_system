const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'AK Solutions_super_secret_key_2026';

// Middleware to verify a valid JWT token exists
const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;

    const requestedUserId = req.query?.userId || req.params?.userId;
    if (requestedUserId && req.user.role !== 'admin' && req.user.userId !== requestedUserId) {
      return res.status(403).json({ message: 'Access Denied: You can only access your own data' });
    }

    next();
  } catch (error) {
    console.error('JWT Verify Error in verifyToken:', error.message, 'URL:', req.originalUrl, 'Token:', req.headers.authorization);
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

const verifyAdminToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;

    const allowedRoles = ['admin', 'franchise', 'channel', 'account_manager', 'inventory_manager', 'finance_manager', 'warehouse_manager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: Admin privileges required' });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      let token = req.headers.authorization;
      if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
      }

      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access Denied: Insufficient Role Permissions' });
      }

      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid or Expired Token' });
    }
  };
};

module.exports = { verifyToken, verifyAdminToken, requireRoles };
