/**
 * Firebase client configuration.
 * Replace these placeholder values with your own project's config
 * (Firebase Console > Project Settings > General > Your apps > SDK setup).
 */
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Base URL of the Express backend API.
// Serving frontend through the same Express app ensures the default
// API path works without needing the host name.
const API_BASE_URL = "https://course-management-system-0z6g.onrender.com/api";

let firebaseApp = null;
let firebaseAuthAvailable = false;

// Firebase is loaded via CDN <script> tags in the HTML. If the SDK or a
// valid config isn't present, the app gracefully falls back to a
// simulated/demo login so the UI is always fully functional.
try {
  if (typeof firebase !== "undefined" && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuthAvailable = true;
  }
} catch (err) {
  console.warn("[firebase-config] Firebase not initialized, using demo mode.", err);
}

window.SCMS_CONFIG = {
    API_BASE_URL: "https://course-management-system-0z6g.onrender.com/api",
    firebaseAuthAvailable: true
};