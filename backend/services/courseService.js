const { firestore, isDemoMode } = require('../firebase/admin');
const { readLocalCourses, writeLocalCourses } = require('../utils/fileHandler');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const { recursiveTotalUnits } = require('../utils/recursiveSum');

const COLLECTION = 'courses';

function genId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------- Local (demo) datastore ------------------------ */

async function localGetAll() {
  return readLocalCourses();
}

async function localCreate(data) {
  const courses = readLocalCourses();
  if (courses.some((c) => c.code === data.code)) {
    throw new AppError(`A course with code "${data.code}" already exists.`, 409);
  }
  const newCourse = { id: genId(), ...data, createdAt: new Date().toISOString() };
  courses.push(newCourse);
  writeLocalCourses(courses);
  return newCourse;
}

async function localUpdate(id, data) {
  const courses = readLocalCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new AppError('Course not found.', 404);

  if (data.code && courses.some((c) => c.code === data.code && c.id !== id)) {
    throw new AppError(`A course with code "${data.code}" already exists.`, 409);
  }

  courses[idx] = { ...courses[idx], ...data, updatedAt: new Date().toISOString() };
  writeLocalCourses(courses);
  return courses[idx];
}

async function localDelete(id) {
  const courses = readLocalCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new AppError('Course not found.', 404);
  const [removed] = courses.splice(idx, 1);
  writeLocalCourses(courses);
  return removed;
}

/* --------------------------- Firestore datastore -------------------------- */

async function firestoreGetAll() {
  const snap = await firestore.collection(COLLECTION).orderBy('createdAt', 'asc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function firestoreCreate(data) {
  const existing = await firestore.collection(COLLECTION).where('code', '==', data.code).limit(1).get();
  if (!existing.empty) {
    throw new AppError(`A course with code "${data.code}" already exists.`, 409);
  }
  const docRef = await firestore.collection(COLLECTION).add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function firestoreUpdate(id, data) {
  const docRef = firestore.collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new AppError('Course not found.', 404);

  if (data.code) {
    const dup = await firestore.collection(COLLECTION).where('code', '==', data.code).get();
    if (dup.docs.some((d) => d.id !== id)) {
      throw new AppError(`A course with code "${data.code}" already exists.`, 409);
    }
  }

  await docRef.update({ ...data, updatedAt: new Date().toISOString() });
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
}

async function firestoreDelete(id) {
  const docRef = firestore.collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new AppError('Course not found.', 404);
  await docRef.delete();
  return { id: doc.id, ...doc.data() };
}

/* ------------------------------ Public API -------------------------------- */

const getAllCourses = () => (isDemoMode ? localGetAll() : firestoreGetAll());

const createCourse = async (rawInput) => {
  const validated = Course.validate(rawInput);
  return isDemoMode ? localCreate(validated) : firestoreCreate(validated);
};

const updateCourse = async (id, rawInput) => {
  // Partial validation: only re-validate fields that were provided.
  const merged = {
    code: rawInput.code ?? undefined,
    title: rawInput.title ?? undefined,
    unit: rawInput.unit ?? undefined,
  };
  const toValidate = {
    code: merged.code ?? 'PLACEHOLDER101',
    title: merged.title ?? 'Placeholder Title',
    unit: merged.unit ?? 1,
  };
  const validated = Course.validate(toValidate);
  const patch = {};
  if (merged.code !== undefined) patch.code = validated.code;
  if (merged.title !== undefined) patch.title = validated.title;
  if (merged.unit !== undefined) patch.unit = validated.unit;

  return isDemoMode ? localUpdate(id, patch) : firestoreUpdate(id, patch);
};

const deleteCourse = (id) => (isDemoMode ? localDelete(id) : firestoreDelete(id));

const findByCode = async (code) => {
  const normalized = Course.normalizeCode(code);
  const all = await getAllCourses();
  return all.find((c) => c.code === normalized) || null;
};

const getTotalUnits = async () => {
  const all = await getAllCourses();
  const grandTotal = recursiveTotalUnits(all);
  return {
    courses: all.map((c) => ({ code: c.code, title: c.title, unit: Number(c.unit) })),
    grandTotal,
  };
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  findByCode,
  getTotalUnits,
};
