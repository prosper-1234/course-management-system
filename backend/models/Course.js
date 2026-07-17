const AppError = require('../utils/AppError');

const CODE_REGEX = /^[A-Z]{2,6}[0-9]{3,4}$/; // e.g. CSC101, CYB2201

class Course {
  constructor({ code, title, unit }) {
    this.code = Course.normalizeCode(code);
    this.title = (title || '').trim();
    this.unit = Number(unit);
  }

  static normalizeCode(code) {
    return (code || '').toString().trim().toUpperCase().replace(/\s+/g, '');
  }

  /**
   * Validates raw input for a course. Throws AppError(422) with a list
   * of field-level messages when invalid.
   */
  static validate({ code, title, unit }) {
    const errors = [];
    const normalizedCode = Course.normalizeCode(code);
    const trimmedTitle = (title || '').toString().trim();
    const numericUnit = Number(unit);

    if (!normalizedCode) {
      errors.push('Course code is required.');
    } else if (!CODE_REGEX.test(normalizedCode)) {
      errors.push('Course code must look like "CSC101" (2-6 letters followed by 3-4 digits).');
    }

    if (!trimmedTitle) {
      errors.push('Course title is required.');
    } else if (trimmedTitle.length < 3) {
      errors.push('Course title must be at least 3 characters long.');
    } else if (!/^[a-zA-Z0-9 &,'()/-]+$/.test(trimmedTitle)) {
      errors.push('Course title contains invalid characters.');
    }

    if (unit === undefined || unit === null || unit === '') {
      errors.push('Credit unit is required.');
    } else if (Number.isNaN(numericUnit)) {
      errors.push('Credit unit must be a number.');
    } else if (!Number.isInteger(numericUnit) || numericUnit < 1 || numericUnit > 6) {
      errors.push('Credit unit must be a whole number between 1 and 6.');
    }

    if (errors.length) {
      throw new AppError('Course validation failed.', 422, errors);
    }

    return { code: normalizedCode, title: trimmedTitle, unit: numericUnit };
  }
}

module.exports = Course;
