require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { PORT, NODE_ENV, CORS_ORIGINS } = require('./config/config');
const { isDemoMode } = require('./firebase/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/authMiddleware');
const { getTotalUnits } = require('./controllers/courseController');
const { login } = require('./controllers/authController');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

/* ---------------------------- Global middleware --------------------------- */
app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/Postman) with no origin.
      if (!origin) return callback(null, true);

      const allowedLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
      if (CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*') || allowedLocalhost.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Serve the frontend static assets from the public folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

/* --------------------------------- Routes --------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SCMS API is running.',
    mode: isDemoMode ? 'demo (local JSON datastore)' : 'live (Firestore)',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/login', login); // POST /api/login (flat, exactly per spec)
app.use('/api/auth', authRoutes); // also mounted at /api/auth/login and /api/auth/me
app.get('/api/units', requireAuth, getTotalUnits); // GET /api/units (flat, per spec)
app.use('/api/courses', courseRoutes);

// Serve frontend entrypoint for any non-API GET request so users can access
// the app directly from the backend server.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

/* ------------------------------ Error handling ----------------------------- */
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 SCMS backend running on http://localhost:${PORT}`);
  console.log(`   Mode: ${isDemoMode ? 'DEMO (local JSON datastore)' : 'LIVE (Firebase Firestore)'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
