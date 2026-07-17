const { auth, isDemoMode } = require('../firebase/admin');
const AppError = require('../utils/AppError');
const { ADMIN_PROFILE } = require('../config/config');

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * In demo mode (no Firebase Admin credentials configured), the check is
 * bypassed and a demo user is attached instead, so the whole app remains
 * usable without live Firebase credentials.
 */
async function requireAuth(req, res, next) {
  if (isDemoMode) {
    req.user = { uid: 'demo-user', ...ADMIN_PROFILE, provider: 'demo' };
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError('Missing authentication token.', 401));
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, ...ADMIN_PROFILE, provider: 'firebase' };
    next();
  } catch (err) {
    next(new AppError('Invalid or expired authentication token.', 401));
  }
}

module.exports = { requireAuth };
