const SESSION_KEY = "scms-session";

const ADMIN_PROFILE = {
  name: "Promise Nasikpo",
  email: "p.nasikpo1001@miva.edu.ng",
  matricNumber: "2025/A/CYB/0295",
  role: "Administrator",
};

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, loggedInAt: Date.now() }));
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Guards dashboard pages: redirect to login if no active session. */
function requireSession() {
  if (!getSession()) {
    window.location.href = "index.html";
  }
}

/**
 * Performs login. Uses real Firebase Anonymous Auth when a live config
 * is present (still "one click, no credentials" per spec); otherwise
 * simulates an instant login so the demo is always fully functional.
 */
async function performLogin() {
  if (window.SCMS_CONFIG.firebaseAuthAvailable) {
    const cred = await firebase.auth().signInAnonymously();
    const idToken = await cred.user.getIdToken();

    try {
      await api.post("/login", { idToken });
    } catch (err) {
      console.warn("[auth] Backend login sync failed, continuing client-side.", err);
    }

    saveSession({ uid: cred.user.uid, provider: "firebase", ...ADMIN_PROFILE });
    return;
  }

  // Demo mode fallback: no credentials required, simulate instantly.
  await api.post("/login", {}).catch(() => null);
  saveSession({ uid: "demo-user", provider: "demo", ...ADMIN_PROFILE });
}

async function performLogout() {
  try {
    if (window.SCMS_CONFIG.firebaseAuthAvailable && firebase.auth().currentUser) {
      await firebase.auth().signOut();
    }
  } finally {
    clearSession();
    window.location.href = "index.html";
  }
}
