// Vercel serverless entry: serves the Express API on the same domain as the site.
// vercel.json rewrites every /api/* request here; Express still sees the original path (e.g. /api/products/featured).
// (A [...path].js catch-all only works in Next.js projects — elsewhere it matches a single segment.)
module.exports = require('../backend/src/app');
