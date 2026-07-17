function success(res, statusCode, message, data = null, meta = null) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function failure(res, statusCode, message, errors = null) {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

module.exports = { success, failure };
