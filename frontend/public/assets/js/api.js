/**
 * Thin wrapper around fetch() for talking to the Express backend.
 * Automatically attaches the Firebase ID token (if available) and
 * normalizes error handling so callers can just `await api.get(...)`.
 */

const api = (() => { const BASE = window.SCMS_CONFIG?.API_BASE_URL || '/api';
  async function getAuthHeader() {
    try {
      if (window.SCMS_CONFIG.firebaseAuthAvailable && firebase.auth().currentUser) {
        const token = await firebase.auth().currentUser.getIdToken();
        return { Authorization: `Bearer ${token}` };
      }
    } catch (err) {
      console.warn("[api] Could not fetch ID token, continuing without it.", err);
    }
    return {};
  }

  async function request(method, path, body) {
    const authHeader = await getAuthHeader();
    const options = {
      method,
      headers: { "Content-Type": "application/json", ...authHeader },
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    let response;
    try {
      response = await fetch(`${BASE}${path}`, options);
    } catch (networkErr) {
      throw new Error(
        "Could not reach the server. Check your connection or that the backend is running."
      );
    }

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new Error("Unexpected server response.");
    }

    if (!response.ok || json.success === false) {
      const message = json.message || `Request failed with status ${response.status}.`;
      const err = new Error(message);
      err.errors = json.errors || null;
      err.status = response.status;
      throw err;
    }

    return json;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    del: (path) => request("DELETE", path),
  };
})();
