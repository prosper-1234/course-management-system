document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip straight to the dashboard.
  if (getSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginBtn = document.getElementById("loginBtn");
  const loginBtnLabel = document.getElementById("loginBtnLabel");
  const loginSpinner = document.getElementById("loginSpinner");

  loginBtn?.addEventListener("click", async () => {
    loginBtn.disabled = true;
    loginBtnLabel.textContent = "Signing you in...";
    loginSpinner.classList.remove("hidden");

    try {
      await performLogin();
      loginBtnLabel.textContent = "Success! Redirecting...";
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Login failed. Please try again.", "error");
      loginBtn.disabled = false;
      loginBtnLabel.textContent = "Login to Dashboard";
      loginSpinner.classList.add("hidden");
    }
  });
});
