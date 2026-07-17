/* ============================== Module state ============================== */
const courseState = {
  all: [],
  page: 1,
  pageSize: 5,
  sortField: "code",
  sortDir: "asc",
  tableSearch: "",
};

/* ================================ Data layer ================================ */
async function fetchCourses({ silent = false } = {}) {
  const tbody = document.getElementById("coursesTableBody");
  if (!silent && tbody) tbody.innerHTML = skeletonRows(courseState.pageSize, 4);

  try {
    const res = await api.get("/courses");
    courseState.all = res.data || [];
    return courseState.all;
  } catch (err) {
    showToast(err.message || "Failed to load courses.", "error");
    return [];
  }
}

async function refreshEverything() {
  await fetchCourses();
  renderDashboardCards();
  renderCoursesTable();
  renderTotalUnitsPage();
}

/* ============================== Dashboard cards ============================== */
function renderDashboardCards() {
  const totalCoursesEl = document.getElementById("statTotalCourses");
  const totalUnitsEl = document.getElementById("statTotalUnits");
  const avgUnitsEl = document.getElementById("statAvgUnits");

  const total = courseState.all.length;
  const grandTotal = recursiveTotalUnits(courseState.all);
  const avg = total ? (grandTotal / total).toFixed(1) : "0.0";

  if (totalCoursesEl) totalCoursesEl.textContent = total;
  if (totalUnitsEl) totalUnitsEl.textContent = grandTotal;
  if (avgUnitsEl) avgUnitsEl.textContent = avg;
}

/* ================================ Add Course ================================ */
function initAddCourseForm() {
  const form = document.getElementById("addCourseForm");
  if (!form) return;

  const codeInput = document.getElementById("courseCode");
  codeInput?.addEventListener("input", () => {
    codeInput.value = codeInput.value.toUpperCase();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const payload = {
      code: document.getElementById("courseCode").value.trim().toUpperCase(),
      title: document.getElementById("courseTitle").value.trim(),
      unit: Number(document.getElementById("courseUnit").value),
    };

    clearFieldErrors(form);
    submitBtn.disabled = true;
    submitBtn.classList.add("btn--loading");

    try {
      await api.post("/courses", payload);
      showToast(`Course "${payload.code}" added successfully.`, "success");
      form.reset();
      await refreshEverything();
    } catch (err) {
      if (err.errors) {
        showToast(err.errors[0], "error");
      } else {
        showToast(err.message || "Could not add course.", "error");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("btn--loading");
    }
  });
}

function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}

/* ================================ View Courses ================================ */
function getFilteredSortedCourses() {
  let list = [...courseState.all];

  if (courseState.tableSearch) {
    const q = courseState.tableSearch.toLowerCase();
    list = list.filter(
      (c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    const dir = courseState.sortDir === "asc" ? 1 : -1;
    const field = courseState.sortField;
    if (field === "unit") return (a.unit - b.unit) * dir;
    return a[field].localeCompare(b[field]) * dir;
  });

  return list;
}

function renderCoursesTable() {
  const tbody = document.getElementById("coursesTableBody");
  const emptyState = document.getElementById("coursesEmptyState");
  const paginationEl = document.getElementById("coursesPagination");
  if (!tbody) return;

  const filtered = getFilteredSortedCourses();
  const totalPages = Math.max(1, Math.ceil(filtered.length / courseState.pageSize));
  courseState.page = Math.min(courseState.page, totalPages);

  const start = (courseState.page - 1) * courseState.pageSize;
  const pageItems = filtered.slice(start, start + courseState.pageSize);

  if (!filtered.length) {
    tbody.innerHTML = "";
    emptyState?.classList.remove("hidden");
  } else {
    emptyState?.classList.add("hidden");
    tbody.innerHTML = pageItems
      .map(
        (c) => `
      <tr>
        <td><span class="badge badge--code">${escapeHtml(c.code)}</span></td>
        <td>${escapeHtml(c.title)}</td>
        <td>${escapeHtml(String(c.unit))}</td>
        <td class="table-actions">
          <button class="icon-btn icon-btn--edit" title="Edit" data-edit="${c.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn icon-btn--delete" title="Delete" data-delete="${c.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </td>
      </tr>`
      )
      .join("");
  }

  renderPagination(paginationEl, totalPages);
  updateSortIndicators();
}

function renderPagination(container, totalPages) {
  if (!container) return;
  const { page } = courseState;
  let html = `<button class="pagination__btn" data-page="prev" ${page === 1 ? "disabled" : ""}>
    <span class="material-symbols-outlined">chevron_left</span></button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination__btn ${i === page ? "pagination__btn--active" : ""}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="pagination__btn" data-page="next" ${page === totalPages ? "disabled" : ""}>
    <span class="material-symbols-outlined">chevron_right</span></button>`;
  container.innerHTML = html;
}

function updateSortIndicators() {
  document.querySelectorAll("[data-sort]").forEach((th) => {
    th.classList.toggle("th--sorted", th.dataset.sort === courseState.sortField);
    const icon = th.querySelector(".sort-icon");
    if (icon) {
      icon.textContent =
        th.dataset.sort === courseState.sortField && courseState.sortDir === "desc"
          ? "arrow_downward"
          : "arrow_upward";
    }
  });
}

function initViewCoursesPage() {
  const searchInput = document.getElementById("tableSearchInput");
  searchInput?.addEventListener(
    "input",
    debounce((e) => {
      courseState.tableSearch = e.target.value.trim();
      courseState.page = 1;
      renderCoursesTable();
    }, 250)
  );

  document.querySelectorAll("[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (courseState.sortField === field) {
        courseState.sortDir = courseState.sortDir === "asc" ? "desc" : "asc";
      } else {
        courseState.sortField = field;
        courseState.sortDir = "asc";
      }
      renderCoursesTable();
    });
  });

  document.getElementById("coursesPagination")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    const val = btn.dataset.page;
    if (val === "prev") courseState.page--;
    else if (val === "next") courseState.page++;
    else courseState.page = Number(val);
    renderCoursesTable();
  });

  document.getElementById("coursesTableBody")?.addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-edit]")?.dataset.edit;
    const deleteId = e.target.closest("[data-delete]")?.dataset.delete;

    if (editId) openEditModal(editId);

    if (deleteId) {
      const course = courseState.all.find((c) => c.id === deleteId);
      const confirmed = await confirmAction({
        title: "Delete course?",
        message: `This will permanently remove ${course?.code} — ${course?.title}.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!confirmed) return;

      try {
        await api.del(`/courses/${deleteId}`);
        showToast("Course deleted.", "success");
        await refreshEverything();
      } catch (err) {
        showToast(err.message || "Could not delete course.", "error");
      }
    }
  });
}

/* ================================= Edit modal ================================= */
function openEditModal(id) {
  const course = courseState.all.find((c) => c.id === id);
  if (!course) return;

  document.getElementById("editCourseId").value = course.id;
  document.getElementById("editCourseCode").value = course.code;
  document.getElementById("editCourseTitle").value = course.title;
  document.getElementById("editCourseUnit").value = course.unit;
  openModal("editCourseModal");
}

function initEditCourseForm() {
  const form = document.getElementById("editCourseForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editCourseId").value;
    const payload = {
      code: document.getElementById("editCourseCode").value.trim().toUpperCase(),
      title: document.getElementById("editCourseTitle").value.trim(),
      unit: Number(document.getElementById("editCourseUnit").value),
    };

    try {
      await api.put(`/courses/${id}`, payload);
      showToast("Course updated successfully.", "success");
      closeModal("editCourseModal");
      await refreshEverything();
    } catch (err) {
      showToast(err.message || "Could not update course.", "error");
    }
  });
}

/* ================================ Search Course ================================ */
function initSearchCoursePage() {
  const form = document.getElementById("searchCourseForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("searchCourseInput").value.trim().toUpperCase();
    const resultEl = document.getElementById("searchCourseResult");
    const notFoundEl = document.getElementById("searchCourseNotFound");
    resultEl.classList.add("hidden");
    notFoundEl.classList.add("hidden");

    if (!code) return;

    try {
      const res = await api.get(`/courses/${code}`);
      const c = res.data;
      document.getElementById("resultCode").textContent = c.code;
      document.getElementById("resultTitle").textContent = c.title;
      document.getElementById("resultUnit").textContent = c.unit;
      resultEl.classList.remove("hidden");
    } catch (err) {
      notFoundEl.classList.remove("hidden");
      notFoundEl.querySelector(".not-found__code").textContent = code;
    }
  });
}

/* ================================ Total Units page ================================ */
function renderTotalUnitsPage() {
  const listEl = document.getElementById("totalUnitsList");
  const grandTotalEl = document.getElementById("grandTotalUnits");
  if (!listEl) return;

  const grandTotal = recursiveTotalUnits(courseState.all);

  listEl.innerHTML = courseState.all.length
    ? courseState.all
        .map(
          (c) => `
      <div class="units-row">
        <span class="units-row__code">${escapeHtml(c.code)}</span>
        <span class="units-row__title">${escapeHtml(c.title)}</span>
        <span class="units-row__unit">${c.unit} unit${c.unit === 1 ? "" : "s"}</span>
      </div>`
        )
        .join("")
    : `<p class="empty-hint">No courses registered yet. Add a course to see the breakdown here.</p>`;

  if (grandTotalEl) grandTotalEl.textContent = grandTotal;
}

/* ============================== Save / Load Courses ============================== */
function initSaveLoadPage() {
  document.getElementById("saveCoursesBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("saveCoursesBtn");
    btn.classList.add("btn--loading");
    try {
      const res = await api.post("/courses/import", { courses: courseState.all });
      showToast(
        `Sync complete — ${res.data.imported.length} saved, ${res.data.skipped.length} already up to date.`,
        "success"
      );
      await refreshEverything();
    } catch (err) {
      showToast(err.message || "Could not save courses.", "error");
    } finally {
      btn.classList.remove("btn--loading");
    }
  });

  document.getElementById("loadCoursesBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("loadCoursesBtn");
    btn.classList.add("btn--loading");
    try {
      await refreshEverything();
      showToast(`${courseState.all.length} course(s) loaded from Firestore.`, "success");
    } finally {
      btn.classList.remove("btn--loading");
    }
  });

  document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
    downloadTextFile("courses.json", JSON.stringify(courseState.all, null, 2), "application/json");
    showToast("courses.json downloaded.", "success");
  });

  document.getElementById("exportTxtBtn")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${window.SCMS_CONFIG.API_BASE_URL}/courses/export/txt`);
      const text = await res.text();
      downloadTextFile("courses.txt", text, "text/plain");
      showToast("courses.txt downloaded.", "success");
    } catch {
      showToast("Could not export as .txt", "error");
    }
  });

  const importInput = document.getElementById("importFileInput");
  importInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const courses = JSON.parse(text);
      const res = await api.post("/courses/import", { courses });
      showToast(
        `Import complete — ${res.data.imported.length} added, ${res.data.skipped.length} skipped.`,
        "success"
      );
      await refreshEverything();
    } catch (err) {
      showToast("Invalid file or import failed. Use a valid courses.json file.", "error");
    } finally {
      importInput.value = "";
    }
  });
}
