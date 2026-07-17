/* ============================= Toast notifications ============================= */
function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    success: "check_circle",
    error: "cancel",
    warning: "warning",
    info: "info",
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close" aria-label="Dismiss">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  const remove = () => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast__close").addEventListener("click", remove);
  setTimeout(remove, duration);
}

/* ================================== Modals ================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("modal-overlay--open");
  document.body.classList.add("no-scroll");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("modal-overlay--open");
  document.body.classList.remove("no-scroll");
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-close-modal]")) {
    closeModal(e.target.closest(".modal-overlay").id);
  }
  if (e.target.classList.contains("modal-overlay")) {
    closeModal(e.target.id);
  }
});

/* ============================ Confirm dialog helper ============================ */
function confirmAction({ title, message, confirmLabel = "Confirm", danger = false }) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    modal.querySelector(".modal__title").textContent = title;
    modal.querySelector(".modal__body").textContent = message;

    const confirmBtn = modal.querySelector("[data-confirm-yes]");
    confirmBtn.textContent = confirmLabel;
    confirmBtn.className = `btn ${danger ? "btn--danger" : "btn--primary"}`;

    const cleanup = () => {
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      closeModal("confirmModal");
    };

    const newConfirmBtn = modal.querySelector("[data-confirm-yes]");
    newConfirmBtn.addEventListener(
      "click",
      () => {
        cleanup();
        resolve(true);
      },
      { once: true }
    );

    modal.querySelector("[data-confirm-no]").addEventListener(
      "click",
      () => {
        closeModal("confirmModal");
        resolve(false);
      },
      { once: true }
    );

    openModal("confirmModal");
  });
}

/* ================================ Theme toggle ================================ */
function initTheme() {
  const saved = localStorage.getItem("scms-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("scms-theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeToggleIcon");
  if (icon) icon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
}

/* ================================= Live clock ================================= */
function startLiveClock() {
  const dateEl = document.getElementById("liveDate");
  const clockEl = document.getElementById("liveClock");
  if (!dateEl && !clockEl) return;

  const tick = () => {
    const now = new Date();
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString(undefined, { hour12: true });
    }
  };
  tick();
  setInterval(tick, 1000);
}

/* ================================ Sidebar toggle ================================ */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");

  hamburger?.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar--open");
    overlay.classList.toggle("sidebar-overlay--visible");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("sidebar--open");
    overlay.classList.remove("sidebar-overlay--visible");
  });

  collapseBtn?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "scms-sidebar-collapsed",
      document.body.classList.contains("sidebar-collapsed")
    );
  });

  if (localStorage.getItem("scms-sidebar-collapsed") === "true") {
    document.body.classList.add("sidebar-collapsed");
  }
}

/* ============================= Profile dropdown ============================= */
function initDropdown() {
  const trigger = document.getElementById("profileTrigger");
  const dropdown = document.getElementById("profileDropdown");
  if (!trigger || !dropdown) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("dropdown--open");
  });

  document.addEventListener("click", () => dropdown.classList.remove("dropdown--open"));

  const notifTrigger = document.getElementById("notifTrigger");
  const notifDropdown = document.getElementById("notifDropdown");
  notifTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle("dropdown--open");
    notifTrigger.querySelector(".notif-badge")?.classList.add("notif-badge--hidden");
  });
}

/* ============================ Skeleton / spinner helpers ============================ */
function skeletonRows(count, columns) {
  return Array.from({ length: count })
    .map(
      () => `<tr class="skeleton-row">${Array.from({ length: columns })
        .map(() => `<td><div class="skeleton-block"></div></td>`)
        .join("")}</tr>`
    )
    .join("");
}

/* ============================ Sidebar active page indicator ============================ */
function setActiveNav(page) {
  document.querySelectorAll(".sidebar__link").forEach((link) => {
    link.classList.toggle("sidebar__link--active", link.dataset.page === page);
  });
  const titleEl = document.getElementById("pageTitle");
  const titles = {
    dashboard: "Dashboard",
    "add-course": "Add Course",
    "view-courses": "View Courses",
    "search-course": "Search Course",
    "total-units": "Total Units",
    "save-load": "Save & Load Courses",
    settings: "Settings",
  };
  if (titleEl) titleEl.textContent = titles[page] || "Dashboard";
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);
});
