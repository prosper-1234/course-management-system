# Student Course Management System (SCMS)

A full-stack, production-ready Student Course Management System for Miva University.

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (no frameworks) — deployed on Firebase Hosting
- **Backend:** Node.js + Express.js REST API
- **Auth:** Firebase Authentication (Anonymous sign-in for one-click demo login)
- **Database:** Firebase Firestore (with an automatic local JSON-file fallback for demo/dev mode)

**Admin profile used throughout the app:**
| Field | Value |
|---|---|
| Name | Hillel David |
| Email | s.david2455@miva.edu.ng |
| Matric Number | 2025/A/CYB/0152 |

---

## 1. Folder structure

```
course-management-system/
├── backend/                     # Express REST API
│   ├── config/
│   │   └── config.js             # env + admin profile constants
│   ├── controllers/
│   │   ├── authController.js
│   │   └── courseController.js
│   ├── data/
│   │   └── courses.json          # local datastore used in demo mode
│   ├── firebase/
│   │   └── admin.js              # Firebase Admin SDK bootstrap (with fallback)
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifies Firebase ID tokens
│   │   ├── errorHandler.js
│   │   └── sanitize.js
│   ├── models/
│   │   └── Course.js             # validation + normalization
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── courseRoutes.js
│   ├── services/
│   │   └── courseService.js      # Firestore <-> local datastore abstraction
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── fileHandler.js        # JSON/TXT export + local persistence
│   │   ├── recursiveSum.js       # recursive total-units calculator
│   │   └── responseHandler.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/                    # Firebase Hosting root
    ├── public/
    │   ├── index.html            # Login page
    │   ├── dashboard.html        # Main app (SPA-style sections)
    │   └── assets/
    │       ├── css/
    │       │   ├── style.css       # tokens, base, shared components
    │       │   ├── login.css
    │       │   ├── dashboard.css
    │       │   └── responsive.css
    │       └── js/
    │           ├── firebase-config.js  # Firebase client SDK config
    │           ├── api.js              # fetch wrapper for the backend
    │           ├── auth.js             # login/logout/session
    │           ├── ui.js               # toasts, modals, theme, clock, sidebar
    │           ├── utils.js            # recursive sum, debounce, helpers
    │           ├── login.js            # login page logic
    │           ├── courses.js          # CRUD, search, units, save/load
    │           └── dashboard.js        # navigation + bootstrap
    ├── firebase.json
    ├── firestore.rules
    ├── firestore.indexes.json
    ├── .firebaserc.example
    └── .gitignore
```

---

## 2. How demo mode works (important)

This project is fully functional **out of the box, with zero configuration**:

- If no Firebase Admin credentials are supplied to the backend, it automatically
  runs in **demo mode**: courses are persisted to `backend/data/courses.json`
  instead of Firestore, and the login/auth check is simulated.
- If no Firebase **client** config is supplied to the frontend (`firebase-config.js`),
  the login button simulates an instant login instead of calling Firebase Auth.
- Once you add real Firebase credentials on both sides (see below), the exact
  same code switches to **live mode** automatically — real Firebase Authentication
  (anonymous sign-in) and real Firestore reads/writes, no code changes required.

---

## 3. Local setup

### Prerequisites
- Node.js 18+
- A free [Firebase project](https://console.firebase.google.com/) (optional for demo mode, required for live mode)

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev        # or: npm start
```

The API boots at `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's running (it reports whether it's in demo or live mode).

### 3.2 Frontend

The frontend is static — no build step. Serve the `frontend/public` folder with
any static server, for example:

```bash
cd frontend/public
npx serve -l 5500
# or: python3 -m http.server 5500
```

Open `http://localhost:5500`. Make sure `CORS_ORIGINS` in `backend/.env`
includes this origin (it does by default).

---

## 4. Enabling live Firebase (optional, for production)

### 4.1 Create a Firebase project
1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Enable **Authentication** → Sign-in method → **Anonymous**.
3. Enable **Firestore Database** → Start in production mode.
4. (Optional) Enable **Storage** if you plan to attach files to courses.

### 4.2 Configure the backend (Firebase Admin SDK)
1. Project Settings → **Service accounts** → **Generate new private key**.
2. Either:
   - Paste the full JSON contents into `FIREBASE_SERVICE_ACCOUNT_JSON` in `backend/.env` (single line), **or**
   - Save the file locally and set `FIREBASE_SERVICE_ACCOUNT_PATH` to its path.
3. Set `FIREBASE_PROJECT_ID` and `FIREBASE_STORAGE_BUCKET`.
4. Restart the backend — the console will log `LIVE MODE`.

### 4.3 Configure the frontend (Firebase Client SDK)
1. Project Settings → **General** → Your apps → **Web app** → copy the config object.
2. Paste the values into `frontend/public/assets/js/firebase-config.js`
   (`firebaseConfig` object) and update `API_BASE_URL` to point at your deployed backend.

### 4.4 Deploy Firestore rules
```bash
cd frontend
cp .firebaserc.example .firebaserc   # then edit with your project ID
firebase deploy --only firestore:rules
```

---

## 5. Deployment

### 5.1 Frontend → Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
cd frontend
firebase deploy --only hosting
```

### 5.2 Backend → any Node host (Render, Railway, Fly.io, Cloud Run, etc.)
1. Push the `backend/` folder to your host of choice.
2. Set the same environment variables from `.env.example` in the host's dashboard.
3. Set `CORS_ORIGINS` to your deployed Firebase Hosting URL
   (e.g. `https://your-project.web.app`).
4. Update `API_BASE_URL` in `frontend/public/assets/js/firebase-config.js`
   to your backend's public URL, then redeploy hosting.

### 5.3 GitHub
```bash
cd course-management-system
git init
git add .
git commit -m "Initial commit: Student Course Management System"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
`.env` and `node_modules/` are already excluded via `.gitignore`.

---

## 6. API reference

All routes are prefixed with `/api`. Course routes require an
`Authorization: Bearer <Firebase ID token>` header in live mode (automatically
bypassed in demo mode).

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server status + current mode |
| POST | `/api/login` | Log in (verifies Firebase ID token, or simulates in demo mode) |
| GET | `/api/auth/me` | Current admin profile |
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create a course `{ code, title, unit }` |
| GET | `/api/courses/:code` | Find a course by code |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |
| GET | `/api/units` | Recursive grand total of all credit units |
| GET | `/api/courses/export/:format` | Export as `json` or `txt` |
| POST | `/api/courses/import` | Bulk import `{ courses: [...] }` |

**Validation rules:** course codes must match `^[A-Z]{2,6}[0-9]{3,4}$`
(e.g. `CSC101`), titles must be 3+ characters, and units must be a whole
number from 1–6. Duplicate course codes are rejected with `409 Conflict`.

---

## 7. Features checklist

- ✅ Glassmorphism login page with one-click simulated/Firebase login
- ✅ Responsive sidebar + navbar dashboard with live clock, search, notifications, profile
- ✅ Add / View / Edit / Delete courses with validation & duplicate prevention
- ✅ Search course by code with a friendly "Course Not Found" state
- ✅ Recursive total-units calculation (both frontend and backend)
- ✅ Save to Firestore / Load from Firestore
- ✅ Export to `courses.json` / `courses.txt`, import from a JSON backup
- ✅ Sortable, searchable, paginated course table
- ✅ Toasts, modals, skeleton loaders, dark/light theme toggle
- ✅ Fully responsive: desktop, tablet, and mobile with a collapsible sidebar
