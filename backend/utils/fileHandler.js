const fs = require('fs');
const path = require('path');
const AppError = require('./AppError');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'courses.json');

/** Ensures backend/data/courses.json exists before reading/writing. */
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readLocalCourses() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    throw new AppError('Failed to read local course data file.', 500);
  }
}

function writeLocalCourses(courses) {
  ensureDataFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(courses, null, 2), 'utf8');
  } catch (err) {
    throw new AppError('Failed to write local course data file.', 500);
  }
}

/** Builds a plain-text export representation of the course list. */
function toTxt(courses) {
  const header = 'CODE\t\tTITLE\t\t\t\t\tUNIT';
  const divider = '-'.repeat(60);
  const lines = courses.map(
    (c) => `${c.code}\t\t${c.title.padEnd(35)}\t${c.unit}`
  );
  const total = courses.reduce((sum, c) => sum + Number(c.unit || 0), 0);
  return [header, divider, ...lines, divider, `TOTAL UNITS: ${total}`].join('\n');
}

module.exports = { ensureDataFile, readLocalCourses, writeLocalCourses, toTxt, DB_FILE };
