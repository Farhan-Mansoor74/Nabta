// middleware/auth.js - Authentication middleware
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Extract token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if role is company
    if (decoded.role === 'company') {
      req.user = await Company.findById(decoded.id);
      req.userRole = 'company';
    } else {
      // Otherwise it's a user
      req.user = await User.findById(decoded.id);
      req.userRole = decoded.role || 'volunteer';
    }

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new ErrorResponse(`Role ${req.userRole} is not authorized to access this route`, 403));
    }
    next();
  };
};