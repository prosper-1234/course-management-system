/**
 * Trims string fields and strips unexpected keys from the request body
 * before it reaches controllers/validation.
 */
function sanitizeCourseBody(req, res, next) {
  const { code, title, unit } = req.body || {};
  req.body = {
    code: typeof code === 'string' ? code.trim() : code,
    title: typeof title === 'string' ? title.trim() : title,
    unit,
  };
  next();
}

module.exports = { sanitizeCourseBody };
