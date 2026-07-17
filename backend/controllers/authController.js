const { auth, isDemoMode } = require('../firebase/admin');
const { ADMIN_PROFILE } = require('../config/config');
const { success, failure } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

/**
 * POST /api/login
 * Body: { idToken } - Firebase ID token obtained client-side after
 * firebase.auth().signInAnonymously() (or any Firebase auth method).
 * In demo mode, no token is required at all — the login is simulated.
 */
async function login(req, res, next) {
  try {
    if (isDemoMode) {
      return success(res, 200, 'Login successful (demo mode).', {
        user: { uid: 'demo-user', provider: 'demo' },
        profile: ADMIN_PROFILE,
      });
    }

    const { idToken } = req.body;
    if (!idToken) {
      throw new AppError('idToken is required to log in.', 400);
    }

    const decoded = await auth.verifyIdToken(idToken);

    return success(res, 200, 'Login successful.', {
      user: { uid: decoded.uid, provider: decoded.firebase?.sign_in_provider || 'firebase' },
      profile: ADMIN_PROFILE,
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Authentication failed. Please try again.', 401));
  }
}

/** GET /api/me - returns the current admin profile */
function me(req, res) {
  return success(res, 200, 'Profile fetched.', { profile: ADMIN_PROFILE, user: req.user });
}

module.exports = { login, me };
