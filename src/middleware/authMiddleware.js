const jwt = require('jsonwebtoken');

// Your JWT Secret (use env variable in production)
const JWT_SECRET = 'your_jwt_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Expecting: Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  console.log("token: "+token)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customer = decoded; // Attach the decoded payload (customer data) to the request
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
