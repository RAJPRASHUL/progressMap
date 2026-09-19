import jwt from 'jsonwebtoken';

/**
 * Authentication middleware guard
 * Validates the Bearer token in the Authorization header.
 * Attaches decoded payload to req.user and req.userId.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const msg = 'Authentication token required';
    return res.status(401).json({ error: msg, message: msg });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('❌  JWT_SECRET is not configured');
    const msg = 'Server authentication error';
    return res.status(500).json({ error: msg, message: msg });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or expired token';
    return res.status(401).json({ error: msg, message: msg });
  }
}

export default requireAuth;
