const { supabase, isConfigured } = require('../config/supabase');
const mockData = require('../data/mockData');

/**
 * GET /api/products
 * Query params: category, concern, origin, sort, limit, page
 */
const getProducts = async (req, res) => {
  const {
    category,
    concern,
    origin,
    sort = 'featured',
    limit = 12,
    page = 1,
  } = req.query;

  if (isConfigured && supabase) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = supabase
        .from('products')
        .select(`
          id, name, slug, tagline, short_description,
          price_pkr, compare_price_pkr, unit_label,
          tags, concern_tags, origin,
          primary_image_url, is_bestseller, is_featured,
          rating_avg, rating_count,
          categories ( id, name, slug )
        `, { count: 'exact' })
        .eq('is_active', true);

      if (category && category !== 'all') {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (concern) {
        query = query.contains('concern_tags', [concern.toUpperCase()]);
      }

      if (origin) {
        query = query.ilike('origin', `%${origin}%`);
      }

      switch (sort) {
        case 'price-asc':
          query = query.order('price_pkr', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price_pkr', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'featured':
        default:
          query = query
            .order('is_featured', { ascending: false })
            .order('is_bestseller', { ascending: false })
            .order('created_at', { ascending: false });
      }

      query = query.range(offset, offset + parseInt(limit) - 1);
      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        return res.json({
          success: true,
          data,
          pagination: {
            total: count || data.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil((count || data.length) / parseInt(limit)),
          },
        });
      }
    } catch (err) {
      console.warn('[getProducts Supabase query failed, falling back to mock dataset]:', err.message);
    }
  }

  // Fallback to in-memory mock dataset
  let filtered = [...mockData.products];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.categories?.slug === category);
  }

  if (concern) {
    const term = concern.toUpperCase();
    filtered = filtered.filter((p) =>
      p.concern_tags?.some((t) => t.toUpperCase().includes(term))
    );
  }

  if (origin) {
    filtered = filtered.filter((p) =>
      p.origin?.toLowerCase().includes(origin.toLowerCase())
    );
  }

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price_pkr - b.price_pkr);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price_pkr - a.price_pkr);
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
      break;
    case 'featured':
    default:
      filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paged = filtered.slice(offset, offset + parseInt(limit));

  return res.json({
    success: true,
    data: paged,
    pagination: {
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filtered.length / parseInt(limit)),
    },
  });
};

/**
 * GET /api/products/featured
 */
const getFeaturedProducts = async (req, res) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, tagline, short_description,
          price_pkr, compare_price_pkr, unit_label,
          tags, primary_image_url, is_bestseller, is_featured,
          rating_avg, rating_count,
          categories ( name, slug )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('is_bestseller', { ascending: false })
        .limit(8);

      if (!error && data && data.length > 0) {
        return res.json({ success: true, data });
      }
    } catch (err) {
      console.warn('[getFeaturedProducts fallback]:', err.message);
    }
  }

  const featured = mockData.products.filter((p) => p.is_featured);
  return res.json({ success: true, data: featured });
};

/**
 * GET /api/products/:slug
 */
const getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name, slug ),
          product_variants ( id, label, price_pkr, compare_price, is_default, sort_order ),
          reviews ( id, reviewer_name, reviewer_city, rating, body, is_verified, created_at )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('reviews.is_approved', true)
        .order('sort_order', { referencedTable: 'product_variants', ascending: true })
        .order('created_at', { referencedTable: 'reviews', ascending: false })
        .single();

      if (!error && product) {
        return res.json({ success: true, data: product });
      }
    } catch (err) {
      console.warn('[getProductBySlug fallback]:', err.message);
    }
  }

  const product = mockData.products.find((p) => p.slug === slug);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  return res.json({ success: true, data: product });
};

/**
 * GET /api/products/:slug/related
 */
const getRelatedProducts = async (req, res) => {
  const { slug } = req.params;

  if (isConfigured && supabase) {
    try {
      const { data: current } = await supabase
        .from('products')
        .select('id, category_id')
        .eq('slug', slug)
        .single();

      if (current) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, slug, tagline, short_description,
            price_pkr, compare_price_pkr, unit_label,
            tags, primary_image_url, is_bestseller,
            rating_avg, rating_count,
            categories ( name, slug )
          `)
          .eq('is_active', true)
          .eq('category_id', current.category_id)
          .neq('id', current.id)
          .limit(4);

        if (!error && data && data.length > 0) {
          return res.json({ success: true, data });
        }
      }
    } catch (err) {
      console.warn('[getRelatedProducts fallback]:', err.message);
    }
  }

  const current = mockData.products.find((p) => p.slug === slug);
  const related = mockData.products
    .filter((p) => p.slug !== slug && (!current || p.category_id === current.category_id))
    .slice(0, 4);

  return res.json({ success: true, data: related.length ? related : mockData.products.slice(0, 4) });
};

module.exports = {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
};
