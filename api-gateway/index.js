const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const proxy = require('express-http-proxy');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// 1. Token Validation Middleware (No token, Expired token, Invalid token -> 401)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// 2. Role Check Middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient role permissions.' });
    }
    next();
  };
}

// Public routes
app.use('/register', proxy('http://localhost:5001'));
app.use('/auth', proxy('http://localhost:5002'));

// Protected & Role-routed microservices
app.use(
  '/admin',
  authenticateToken,
  authorizeRoles('admin'),
  proxy('http://localhost:5003')
);

app.use(
  '/user',
  authenticateToken,
  authorizeRoles('user', 'admin'),
  proxy('http://localhost:5004')
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});