const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('YOUR_PROJECT_REF') &&
  supabaseKey &&
  !supabaseKey.includes('your_service_role_key')
);

let supabase = null;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('⚠️ Supabase client initialization error, falling back to mock storage:', err.message);
  }
} else {
  console.log('ℹ️ Running with botanical mock seed dataset (configure .env with Supabase credentials for production DB).');
}

// In production (e.g. Vercel serverless) in-memory storage is wiped between requests,
// so writes must go to Supabase or be refused, never silently kept in memory.
const writesUnavailable = process.env.NODE_ENV === 'production' && !isConfigured;
if (writesUnavailable) {
  console.error('⚠️ Supabase is not configured in production: orders and sign-ups will be refused.');
}

module.exports = {
  supabase,
  isConfigured,
  writesUnavailable,
};
