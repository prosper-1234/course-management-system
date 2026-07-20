const SESSION_KEY = "scms-session";

const ADMIN_PROFILE = {
  name: "Abubakar Sadiq Mohammed",
  email: "a.mohammed0373@miva.edu.ng",
  matricNumber: "2025/A/CYB/0200",
  department: "Cybersecurity",
  role: "Administrator",
};

function saveSession(user) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user,
      loggedInAt: Date.now(),
    })
  );
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

function requireSession() {
  if (!getSession()) {
    window.location.href = "index.html";
  }
}

async function performLogin() {
  try {
    await api.post("/login", {});

    saveSession({
      uid: "demo-user",
      provider: "backend",
      ...ADMIN_PROFILE,
    });
  } catch (err) {
    throw new Error("Login failed. Please try again.");
  }
}

async function performLogout() {
  clearSession();
  window.location.href = "index.html";
}