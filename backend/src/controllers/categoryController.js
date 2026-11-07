const { supabase, isConfigured, writesUnavailable } = require('../config/supabase');
const mockData = require('../data/mockData');

/**
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json({ success: true, data });
      }
    } catch (err) {
      console.warn('[getCategories fallback]:', err.message);
    }
  }

  return res.json({ success: true, data: mockData.categories });
};

/**
 * POST /api/newsletter
 */
const subscribeNewsletter = async (req, res) => {
  if (writesUnavailable) {
    return res.status(503).json({ success: false, message: 'Sign-up is temporarily unavailable. Please try again later.' });
  }
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  if (isConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: cleanEmail });

      if (error) {
        if (error.code === '23505') {
          return res.json({ success: true, message: 'Already subscribed. Thank you!' });
        }
        throw error;
      }

      return res.status(201).json({ success: true, message: 'Subscribed successfully. Welcome to the apothecary.' });
    } catch (err) {
      console.error('[subscribeNewsletter]', err.message);
      return res.status(500).json({ success: false, message: 'Could not subscribe right now. Please try again.' });
    }
  }

  if (mockData.subscribers.has(cleanEmail)) {
    return res.json({ success: true, message: 'Already subscribed. Thank you!' });
  }

  mockData.subscribers.add(cleanEmail);
  return res.status(201).json({ success: true, message: 'Subscribed successfully. Welcome to the apothecary.' });
};

module.exports = { getCategories, subscribeNewsletter };
