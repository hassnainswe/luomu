// Local / VPS entrypoint. On Vercel, api/[...path].js serves the same app as a function.
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌿 LUOMU API running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
});
