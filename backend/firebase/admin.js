/**
 * Firebase Admin SDK bootstrap.
 *
 * In production, provide FIREBASE_SERVICE_ACCOUNT_JSON (inline JSON) or
 * FIREBASE_SERVICE_ACCOUNT_PATH (path to the downloaded key file) via
 * environment variables. If neither is present, the app boots in
 * "demo mode": Firestore calls are transparently swapped for a local
 * JSON-file datastore so the whole system still works end-to-end
 * without any cloud credentials.
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let firestore = null;
let auth = null;
let isDemoMode = true;

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error('[firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
      return null;
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolved = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(resolved)) {
      return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    }
    console.error(`[firebase] Service account file not found at ${resolved}`);
    return null;
  }

  return null;
}

function initFirebase() {
  const serviceAccount = loadServiceAccount();

  if (!serviceAccount) {
    console.warn(
      '[firebase] No service account configured — starting in DEMO MODE. ' +
      'Courses will be persisted to backend/data/courses.json instead of Firestore.'
    );
    return { firestore: null, auth: null, isDemoMode: true };
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log('[firebase] Firebase Admin initialized successfully — LIVE MODE.');
    return { firestore: admin.firestore(), auth: admin.auth(), isDemoMode: false };
  } catch (err) {
    console.error('[firebase] Initialization failed, falling back to DEMO MODE:', err.message);
    return { firestore: null, auth: null, isDemoMode: true };
  }
}

const initialized = initFirebase();
firestore = initialized.firestore;
auth = initialized.auth;
isDemoMode = initialized.isDemoMode;

module.exports = { admin, firestore, auth, isDemoMode };
