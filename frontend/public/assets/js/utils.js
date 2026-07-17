/**
 * Recursively sums course units on the client (mirrors backend/utils/recursiveSum.js).
 * Used for instant UI feedback without waiting on a network round-trip.
 */
function recursiveTotalUnits(courses, index = 0) {
  if (!Array.isArray(courses) || index >= courses.length) return 0;
  const unit = Number(courses[index].unit) || 0;
  return unit + recursiveTotalUnits(courses, index + 1);
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function downloadTextFile(filename, text, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
