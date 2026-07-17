const express = require('express');
const {
  getCourses,
  getCourseByCode,
  createCourse,
  updateCourse,
  deleteCourse,
  getTotalUnits,
  exportCourses,
  importCourses,
} = require('../controllers/courseController');
const { requireAuth } = require('../middleware/authMiddleware');
const { sanitizeCourseBody } = require('../middleware/sanitize');

const router = express.Router();

// All course routes require authentication (bypassed automatically in demo mode)
router.use(requireAuth);

router.get('/units', getTotalUnits);
router.get('/export/:format', exportCourses);
router.post('/import', importCourses);

router.get('/', getCourses);
router.post('/', sanitizeCourseBody, createCourse);
router.get('/:code', getCourseByCode);
router.put('/:id', sanitizeCourseBody, updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
