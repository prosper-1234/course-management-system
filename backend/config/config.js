require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5000,http://localhost:5500')
    .split(',')
    .map((o) => o.trim()),

  // Static admin/demo profile used throughout the UI, per project spec.
  ADMIN_PROFILE: {
    name: 'Promise Nasikpo',
    email: 'p.nasikpo1001@miva.edu.ng',
    matricNumber: '2025/A/CYB/0295',
    role: 'Administrator',
  },
};
