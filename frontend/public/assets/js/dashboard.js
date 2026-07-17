document.addEventListener("DOMContentLoaded", async () => {
  requireSession();
  const session = getSession();

  injectProfile(session);
  initSidebar();
  initDropdown();
  startLiveClock();
  initNavigation();
  initAddCourseForm();
  initEditCourseForm();
  initViewCoursesPage();
  initSearchCoursePage();
  initSaveLoadPage();
  initGlobalSearch();
  initSettingsPage(session);

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    const confirmed = await confirmAction({
      title: "Log out?",
      message: "You'll need to log in again to access your dashboard.",
      confirmLabel: "Log out",
      danger: true,
    });
    if (confirmed) performLogout();
  });

  showLoadingOverlay(true);
  await refreshEverything();
  showLoadingOverlay(false);
});

/* ============================== Profile injection ============================== */
function injectProfile(session) {
  const nameTargets = document.querySelectorAll("[data-admin-name]");
  const emailTargets = document.querySelectorAll("[data-admin-email]");
  const matricTargets = document.querySelectorAll("[data-admin-matric]");
  const initialsTargets = document.querySelectorAll("[data-admin-initials]");

  const name = session?.user?.name || ADMIN_PROFILE.name;
  const email = session?.user?.email || ADMIN_PROFILE.email;
  const matric = session?.user?.matricNumber || ADMIN_PROFILE.matricNumber;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  nameTargets.forEach((el) => (el.textContent = name));
  emailTargets.forEach((el) => (el.textContent = email));
  matricTargets.forEach((el) => (el.textContent = matric));
  initialsTargets.forEach((el) => (el.textContent = initials));

  const greetEl = document.getElementById("welcomeGreeting");
  if (greetEl) {
    greetEl.textContent = "welcome Promise Nasikpo";
  }
}

/* ============================== Section navigation ============================== */
function initNavigation() {
  document.querySelectorAll(".sidebar__link[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      showPage(page);

      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebarOverlay");
      sidebar?.classList.remove("sidebar--open");
      overlay?.classList.remove("sidebar-overlay--visible");
    });
  });
}

function showPage(page) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("page-section--active", section.id === `page-${page}`);
  });
  setActiveNav(page);
  window.location.hash = page;
}

/* ============================== Global navbar search ============================== */
function initGlobalSearch() {
  const input = document.getElementById("globalSearchInput");
  input?.addEventListener(
    "input",
    debounce((e) => {
      const q = e.target.value.trim();
      if (!q) return;
      showPage("view-courses");
      courseState.tableSearch = q;
      const tableInput = document.getElementById("tableSearchInput");
      if (tableInput) tableInput.value = q;
      courseState.page = 1;
      renderCoursesTable();
    }, 300)
  );
}

/* ============================== Settings page ============================== */
function initSettingsPage(session) {
  const themeSelect = document.getElementById("settingsThemeSelect");
  if (themeSelect) {
    themeSelect.value = localStorage.getItem("scms-theme") || "light";
    themeSelect.addEventListener("change", () => {
      document.documentElement.setAttribute("data-theme", themeSelect.value);
      localStorage.setItem("scms-theme", themeSelect.value);
      updateThemeIcon(themeSelect.value);
    });
  }

  document.getElementById("settingsPageSizeSelect")?.addEventListener("change", (e) => {
    courseState.pageSize = Number(e.target.value);
    courseState.page = 1;
    renderCoursesTable();
  });
}

/* ============================== Loading overlay ============================== */
function showLoadingOverlay(visible) {
  const overlay = document.getElementById("pageLoadingOverlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", !visible);
}

/* Restore last visited page on load, or default to dashboard */
window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  showPage(hash || "dashboard");
});
