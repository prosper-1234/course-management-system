const AppError = require('../utils/AppError');

/* 404 handler for unmatched routes */
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/* Central error handler - must be registered last */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message, errors } = err;

  if (!(err instanceof AppError)) {
    console.error('[UNHANDLED ERROR]', err);
    statusCode = 500;
    message = 'Internal server error. Please try again later.';
    errors = null;
  }

  statusCode = statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: message || 'Something went wrong.',
    ...(errors ? { errors } : {}),
  });
}

module.exports = { notFound, errorHandler };
