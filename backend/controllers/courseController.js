const courseService = require('../services/courseService');
const { success, failure } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const { toTxt } = require('../utils/fileHandler');

/* GET /api/courses */
async function getCourses(req, res, next) {
  try {
    const courses = await courseService.getAllCourses();
    return success(res, 200, 'Courses fetched successfully.', courses, { count: courses.length });
  } catch (err) {
    next(err);
  }
}

/* GET /api/courses/:code */
async function getCourseByCode(req, res, next) {
  try {
    const course = await courseService.findByCode(req.params.code);
    if (!course) {
      throw new AppError(`No course found with code "${req.params.code.toUpperCase()}".`, 404);
    }
    return success(res, 200, 'Course found.', course);
  } catch (err) {
    next(err);
  }
}

/* POST /api/courses */
async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.body);
    return success(res, 201, 'Course added successfully.', course);
  } catch (err) {
    next(err);
  }
}

/* PUT /api/courses/:id */
async function updateCourse(req, res, next) {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    return success(res, 200, 'Course updated successfully.', course);
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/courses/:id */
async function deleteCourse(req, res, next) {
  try {
    const course = await courseService.deleteCourse(req.params.id);
    return success(res, 200, 'Course deleted successfully.', course);
  } catch (err) {
    next(err);
  }
}

/* GET /api/units - recursive grand total */
async function getTotalUnits(req, res, next) {
  try {
    const result = await courseService.getTotalUnits();
    return success(res, 200, 'Total units calculated.', result);
  } catch (err) {
    next(err);
  }
}

/* GET /api/courses/export/:format(json|txt) */
async function exportCourses(req, res, next) {
  try {
    const { format } = req.params;
    const courses = await courseService.getAllCourses();

    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="courses.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(courses, null, 2));
    }

    if (format === 'txt') {
      res.setHeader('Content-Disposition', 'attachment; filename="courses.txt"');
      res.setHeader('Content-Type', 'text/plain');
      return res.send(toTxt(courses));
    }

    throw new AppError('Unsupported export format. Use "json" or "txt".', 400);
  } catch (err) {
    next(err);
  }
}

/* POST /api/courses/import - body: { courses: [...] } */
async function importCourses(req, res, next) {
  try {
    const { courses } = req.body;
    if (!Array.isArray(courses)) {
      throw new AppError('Request body must contain a "courses" array.', 400);
    }

    const results = { imported: [], skipped: [] };
    for (const raw of courses) {
      try {
        const created = await courseService.createCourse(raw);
        results.imported.push(created);
      } catch (err) {
        results.skipped.push({ input: raw, reason: err.message });
      }
    }

    return success(res, 201, `Import complete: ${results.imported.length} added, ${results.skipped.length} skipped.`, results);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCourses,
  getCourseByCode,
  createCourse,
  updateCourse,
  deleteCourse,
  getTotalUnits,
  exportCourses,
  importCourses,
};
