/**
 * Recursively sums the `unit` field of a list of course objects.
 * Implemented recursively (not with .reduce/for-loops) to satisfy the
 * "use a recursive function" requirement for the Total Units feature.
 *
 * @param {Array<{unit: number}>} courses
 * @param {number} index - current recursion pointer (internal use)
 * @returns {number} grand total of all units
 */
function recursiveTotalUnits(courses, index = 0) {
  if (!Array.isArray(courses) || index >= courses.length) {
    return 0;
  }
  const currentUnit = Number(courses[index].unit) || 0;
  return currentUnit + recursiveTotalUnits(courses, index + 1);
}

module.exports = { recursiveTotalUnits };
