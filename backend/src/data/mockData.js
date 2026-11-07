/**
 * LUOMU catalog — sourced from the client's product sheets (website.docx, website Scrub.docx).
 * Used when Supabase is not configured. supabase/migrations/002_real_catalog.sql seeds the same data.
 *
 * Inactive products are priced but have no photo yet; add primary_image_url/images and flip is_active.
 */

const IMG = '/images/products';

const categories = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    name: 'Hair & Scalp',
    slug: 'hair-scalp',
    description: 'Pure herbal hair oils that nourish the scalp, strengthen roots and restore natural shine.',
    sort_order: 1,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    name: 'Body Care',
    slug: 'body-care',
    description: 'Glow oils and hand-sealed scrubs for soft, deeply hydrated skin.',
    sort_order: 2,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    name: 'Face Care',
    slug: 'skin-care',
    description: 'Natural masks that brighten, gently exfoliate and even out skin tone.',
    sort_order: 3,
  },
];

const cat = (slug) => {
  const c = categories.find((x) => x.slug === slug);
  return { category_id: c.id, categories: { id: c.id, name: c.name, slug: c.slug } };
};

const OIL_WASHING_TIP =
  'Made with natural oils, so it may feel thick. Apply shampoo to dry hair first. Massage, add water, and rinse. Repeat if needed.';
const OIL_CAUTIONS =
  'For external use only. Our oil is 100% pure, with no additives or silicone. This is great for your hair, but natural oil can feel stubborn to wash out. A second wash is normal with natural oils.';
const SCRUB_STORAGE =
  'Use within 3 months of purchase. Store at room temperature in a cool, dry place with the lid tightly closed. Always use a clean, dry spoon to scoop out the product and avoid wet hands. If you have ants at home, keep the jar away from them — storing it in a plastic bag helps.';
const SCRUB_DISCLAIMER =
  'Due to heat and transit time, excess oils in the scrub may occasionally leak from the jar, even with a seal. Seals are applied by hand. Any slight leakage does not affect performance, and the scrub settles back at room temperature — a sign of real oils and butters.';
const SCRUB_CAUTIONS =
  'For external body use only. Do not apply to freshly shaved skin, open wounds, or broken or irritated skin. Avoid contact with eyes.';

const allProducts = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    ...cat('hair-scalp'),
    name: 'Herbelle Hair Oil',
    slug: 'herbelle-hair-oil',
    tagline: 'Hair Oil · 100 ML',
    short_description: 'A 100% pure herbal blend that nourishes the scalp, strengthens roots and restores natural shine.',
    description:
      'A 100% pure organic and herbal blend, free from harsh chemicals, sulfates and parabens. It stimulates microcirculation to wake up dormant follicles, reduces breakage, repairs split ends and enhances natural shine — in a lightweight formula that absorbs into scalp and hair without feeling greasy.',
    price_pkr: 2250,
    compare_price_pkr: null,
    sku: 'LM-HERB-100',
    unit_label: '100 ML',
    tags: ['HANDCRAFTED'],
    concern_tags: ['HAIR FALL', 'SCALP CARE', 'DRY HAIR'],
    origin: null,
    standard: '100% Natural & Vegan',
    primary_image_url: `${IMG}/herbelle-studio.jpg`,
    images: [`${IMG}/herbelle-studio.jpg`, `${IMG}/herbelle-lifestyle.jpg`, `${IMG}/herbelle-linen.jpg`],
    benefits: [
      { title: 'Nourishes & Revitalizes the Scalp', desc: 'Delivers essential nutrients from pure organic oils and herbs directly to the scalp, creating the optimal environment for healthy hair growth.' },
      { title: 'Strengthens Roots to Reduce Breakage', desc: 'Fortifies weak strands right from the root, minimizing hair fall and preventing split ends.' },
      { title: 'Restores Natural Shine & Softness', desc: 'Deeply hydrates coarse or dry hair without a heavy, greasy residue, restoring smooth texture and natural luster.' },
      { title: '100% Pure & Plant-Based', desc: 'Free from harsh chemicals, sulfates, parabens and synthetic additives — safe for all hair types and everyday use.' },
    ],
    how_to_use: `Shake well before use. Massage 8–10 drops into scalp and lengths. Massaging helps spread the oil and relaxes the scalp. Leave for minimum 60 minutes, then wash.\n\nWashing tip: ${OIL_WASHING_TIP}`,
    ingredients:
      'Yellow Mustard Seed Oil, Alkanet Root Extract, Fenugreek Seed Extract, Black Seed Extract, Hibiscus Flower Extract, Flex Seed Extract, Clove, Aloe Vera, Curry Leaf Extract, Rosemary Leaf Extract, Jasmine Flower.',
    cautions: OIL_CAUTIONS,
    storage: null,
    disclaimer:
      'Results vary based on individual scalp condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
    is_bestseller: false,
    is_featured: true,
    is_active: true,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000011', label: 'Single · 100 ML', price_pkr: 2250, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000012', label: 'Pack of 2 · Free Delivery', price_pkr: 4400, compare_price: 4500, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    ...cat('hair-scalp'),
    name: 'Rosemary Fenugreek Infused Hair Oil',
    slug: 'rosemary-fenugreek-hair-oil',
    tagline: 'Hair Growth Oil · 100 ML',
    short_description: 'High-concentration rosemary and fresh fenugreek sprouts to wake dormant follicles for thicker, stronger hair.',
    description:
      'Thicker, stronger hair starts at the scalp — and this rosemary hair growth oil is formulated to get you there. Blended with high-concentration rosemary oil and fenugreek sprouts extracted fresh, it improves blood circulation to the scalp, reduces inflammation, and wakes up dormant hair follicles that have stopped producing. Lightweight enough for regular use, it strengthens roots from the first application and supports visibly denser hair with consistent use over 3 to 6 months.',
    price_pkr: 2350,
    compare_price_pkr: null,
    sku: 'LM-ROSE-100',
    unit_label: '100 ML',
    tags: ['HAIR GROWTH'],
    concern_tags: ['HAIR GROWTH', 'HAIR FALL', 'SCALP CARE'],
    origin: null,
    standard: '100% Natural & Vegan',
    primary_image_url: `${IMG}/rosemary-fenugreek.jpg`,
    images: [`${IMG}/rosemary-fenugreek.jpg`, `${IMG}/oil-trio-marble.jpg`],
    benefits: [
      { title: 'Faster Hair Growth', desc: 'Rosemary and fenugreek work together to stimulate follicle activity, promoting new growth in thinning and sparse areas.' },
      { title: 'Reduced Hair Fall', desc: 'Strengthens hair from the root up, so each strand anchors better and sheds less with every wash.' },
      { title: 'Less Scalp Inflammation', desc: 'Anti-inflammatory botanicals soothe an irritated scalp, removing one of the most common hidden causes of excessive hair fall.' },
      { title: 'Stronger, Thicker Strands', desc: 'Regular use coats and conditions each strand along the shaft, reducing breakage and building visible volume over time.' },
      { title: 'Dormant Follicle Activation', desc: 'The concentrated formula targets follicles that have slowed or stopped, gradually reactivating them for new growth cycles.' },
    ],
    how_to_use: `Shake well before use. Massage 10–12 drops into scalp and lengths. Massaging helps spread the oil and relaxes the scalp. Leave for minimum 60 minutes, then wash.\n\nWashing tip: ${OIL_WASHING_TIP}`,
    ingredients: 'Yellow Mustard Seed Oil, Coconut Oil, Rosemary Leaf Extract, Fenugreek Sprouts, Rosemary Oil, Cloves, and Flower Oil.',
    cautions: OIL_CAUTIONS,
    storage: null,
    disclaimer:
      'Results vary based on individual scalp condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
    is_bestseller: false,
    is_featured: true,
    is_active: true,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000021', label: 'Single · 100 ML', price_pkr: 2350, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000022', label: 'Pack of 2 · Free Delivery', price_pkr: 4600, compare_price: 4700, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    ...cat('body-care'),
    name: 'Almond & Tea Tree Glow Oil',
    slug: 'almond-tea-tree-glow-oil',
    tagline: 'Body Oil · 100 ML',
    short_description: 'Sweet almond and tea tree in a lightweight body oil that hydrates, clarifies and leaves a satin glow.',
    description:
      'Nourish, protect, and restore your skin with our Almond & Tea Tree Body Oil — a balanced blend designed to deliver deep hydration while clarifying and soothing the skin. The anti-inflammatory and anti-bacterial properties of tea tree oil meet naturally glossy almond oil and pure essential extracts in a lightweight formula that restores elasticity and leaves a radiant, satin finish without any greasy feel.',
    price_pkr: 2450,
    compare_price_pkr: null,
    sku: 'LM-ALMT-100',
    unit_label: '100 ML',
    tags: ['BODY GLOW'],
    concern_tags: ['DEEP HYDRATION', 'BODY BLEMISHES'],
    origin: null,
    standard: '100% Natural & Vegan',
    primary_image_url: `${IMG}/almond-tea-tree.jpg`,
    images: [`${IMG}/almond-tea-tree.jpg`, `${IMG}/oil-trio-linen.jpg`],
    benefits: [
      { title: 'Deep & Long-Lasting Hydration', desc: 'Rich in fatty acids and Vitamin E, sweet almond oil penetrates the skin barrier to lock in moisture and soften dry, rough areas.' },
      { title: 'Clears & Prevents Body Blemishes', desc: 'The purifying qualities of tea tree oil help keep pores clear, helping prevent body acne on the chest, back and shoulders.' },
      { title: 'Improves Skin Tone & Texture', desc: 'Regular application helps smooth uneven texture, fade minor scars or dark spots, and improve overall elasticity.' },
      { title: 'Fast-Absorbing & Non-Greasy', desc: 'A lightweight body treatment that absorbs quickly into damp skin, leaving a silky, healthy glow rather than an oily residue.' },
      { title: 'All-Natural & Refreshing', desc: 'Free from synthetic fragrances, harsh chemicals and parabens, with a clean, herbal-nutty aroma.' },
    ],
    how_to_use:
      'Step 1 — Cleanse: shower or bathe with warm water, or use our bath salt scrub.\nStep 2 — Drop & warm: dispense 3–5 drops onto palms and warm between hands.\nStep 3 — Massage: gently massage into damp skin from neck to toe until smooth and radiant.',
    ingredients: 'Sweet Almond Oil, Coconut Oil, Jojoba Oil, Argan Kernel Oil, Tea Tree Leaf Oil, Jasmine Oil, Vitamin E.',
    cautions:
      'For external use only. Contains essential oils; do a patch test on a small area of skin 24 hours before full application. Avoid direct contact with eyes. If irritation occurs, discontinue use immediately.',
    storage: null,
    disclaimer:
      'Results vary based on individual skin condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
    is_bestseller: false,
    is_featured: true,
    is_active: true,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000031', label: 'Single · 100 ML', price_pkr: 2450, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000032', label: 'Pack of 2 · Free Delivery', price_pkr: 4700, compare_price: 4900, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    ...cat('skin-care'),
    name: 'Daily Grind & Glow Face Mask',
    slug: 'daily-grind-glow-face-mask',
    tagline: 'Face Mask · 150 G',
    short_description: 'Finely ground coffee, roasted turmeric and rice flour to buff away dullness and lift tan.',
    description:
      'Unveil a radiant, refreshed complexion with our invigorating blend of finely ground coffee, gently roasted turmeric, and coarse rice flour — designed to buff away dullness and remove skin tan.',
    price_pkr: 1450,
    compare_price_pkr: null,
    sku: 'LM-MASK-DGG',
    unit_label: '150 G',
    tags: ['FACE MASK'],
    concern_tags: ['TAN & DULLNESS', 'EXFOLIATION'],
    origin: null,
    standard: '100% Natural',
    primary_image_url: null, // TODO(client): photo not supplied
    images: [],
    benefits: [
      { title: 'Brightens & Evens Tone', desc: 'Roasted turmeric is rich in antioxidants that fade dark spots, soothe inflammation, and restore a natural, healthy glow.' },
      { title: 'Exfoliates & Smooths', desc: 'Fine rice flour gently removes dead skin cells and absorbs excess oil, leaving skin soft, smooth and refined.' },
      { title: 'Firms & Revitalizes', desc: 'Coffee boosts circulation, tightens pores, and energizes dull skin to help reduce puffiness and reveal a fresher complexion.' },
    ],
    how_to_use:
      'In a small bowl, mix 2–3 teaspoons of mask powder with water, milk or rosewater to form a smooth paste. Apply evenly to a clean, damp face and neck, avoiding the eye and lip areas. Leave on for 10–15 minutes until almost dry. Wet your hands with warm water and scrub gently in circular motions before rinsing thoroughly. Pat dry and follow with your moisturizer. Use 2–3 times a week for best results.',
    ingredients: 'Coffee Powder, Roasted Turmeric Root Powder, Rice Flour.',
    cautions: null,
    storage: SCRUB_STORAGE,
    disclaimer:
      'Due to shipping and transit, fine powder may occasionally sift around the inner seal. Seals are applied by hand, and with zero synthetic anti-caking agents slight settling is normal. It does not affect performance, safety or quality — simply break up any clumps with a clean, dry spoon before mixing.',
    is_bestseller: false,
    is_featured: false,
    is_active: false,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000041', label: 'Single · 150 G', price_pkr: 1450, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000042', label: 'Pack of 2 · Free Delivery', price_pkr: 2600, compare_price: 2900, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    ...cat('body-care'),
    name: 'Pink Himalayan Coconut Bath Salt Scrub',
    slug: 'pink-himalayan-coconut-bath-salt-scrub',
    tagline: 'Body Scrub · 300 G',
    short_description: 'Pink Himalayan salt and coconut to exfoliate, unclog pores and leave skin velvety smooth.',
    description:
      'Expertly crafted to gently remove dead skin cells, unclog pores, and stimulate surface circulation, this rejuvenating body scrub leaves your skin feeling velvety smooth and visibly glowing.',
    price_pkr: 1750,
    compare_price_pkr: null,
    sku: 'LM-SCRB-PHC',
    unit_label: '300 G',
    tags: ['BODY SCRUB'],
    concern_tags: ['EXFOLIATION', 'DEEP HYDRATION'],
    origin: null,
    standard: '100% Natural',
    primary_image_url: null, // TODO(client): photo not supplied
    images: [],
    benefits: [
      { title: 'Deeply Hydrates & Softens', desc: 'Rich coconut intensely moisturizes dry skin, leaving it silky-smooth without stripping natural oils.' },
      { title: 'Detoxifies & Mineralizes', desc: 'Packed with over 84 trace minerals, pink Himalayan salt helps draw out impurities while restoring mineral balance.' },
      { title: 'Soothes Muscle Tension', desc: 'A warm soak helps relax tired, aching muscles and eases joint stiffness after long days or workouts.' },
      { title: 'Nourishes Skin Barrier', desc: 'Natural fatty acids in coconut work with bath salts to calm redness, irritation and dryness.' },
    ],
    how_to_use:
      'In the shower or bath, apply a generous scoop to damp skin. Gently massage in circular motions, focusing on rough areas. Rinse thoroughly with warm water and body wash. Clean the tub of oil residue.',
    ingredients: 'Organic Himalayan Pink Salt, Glycerin, Coconut Oil, Rose Flower Petals, Essential Rose Flower Oil, Vitamin E.',
    cautions: SCRUB_CAUTIONS,
    storage: SCRUB_STORAGE,
    disclaimer: SCRUB_DISCLAIMER,
    is_bestseller: false,
    is_featured: false,
    is_active: false,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000051', label: 'Single · 300 G', price_pkr: 1750, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000052', label: 'Pack of 2 · Free Delivery', price_pkr: 3500, compare_price: null, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    ...cat('body-care'),
    name: 'Shea & Silk Scrub',
    slug: 'shea-silk-scrub',
    tagline: 'Face & Body Scrub · 250 G',
    short_description: 'Raw shea butter and silk proteins polish away dead skin while drenching it in lasting moisture.',
    description:
      'Indulge your skin in the ultimate velvet-touch treatment. Our Shea & Silk Scrub blends deeply moisturizing raw shea butter with luxurious silk proteins to polish away dead skin cells while drenching your body in rich, lasting moisture.',
    price_pkr: 2150,
    compare_price_pkr: null,
    sku: 'LM-SCRB-SHS',
    unit_label: '250 G',
    tags: ['BODY SCRUB'],
    concern_tags: ['EXFOLIATION', 'DEEP HYDRATION'],
    origin: null,
    standard: '100% Natural',
    primary_image_url: `${IMG}/shea-silk-scrub.jpg`,
    images: [`${IMG}/shea-silk-scrub.jpg`],
    benefits: [
      { title: 'Deep Hydration & Moisture', desc: 'Rich shea butter deeply nourishes dry skin, creating a long-lasting barrier that restores softness and elasticity.' },
      { title: 'Silky Smooth Finish', desc: 'Pure silk proteins enhance skin texture, leaving your body touchably soft, smooth and velvety.' },
      { title: 'Gently Exfoliates', desc: 'Buffs away dead skin cells and dullness to reveal a fresh, healthy, radiant complexion.' },
      { title: 'Protects & Replenishes', desc: 'Packed with natural vitamins and essential fatty acids to calm irritation and support skin repair.' },
    ],
    how_to_use:
      'Apply a generous scoop to damp skin on your face or body. Gently massage in circular motions, focusing on rough areas. Rinse thoroughly with warm water and body wash. Clean the tub of oil residue.',
    ingredients: 'Whipped Shea Butter, Organic Himalayan Pink Salt, Rice Flour, Glycerin, Coconut Oil, Vitamin E.',
    cautions: SCRUB_CAUTIONS,
    storage: SCRUB_STORAGE,
    disclaimer: SCRUB_DISCLAIMER,
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    rating_avg: 0,
    rating_count: 0,
    product_variants: [
      { id: '20000000-0000-4000-8000-000000000061', label: 'Single · 250 G', price_pkr: 2150, compare_price: null, free_delivery: false, is_default: true, sort_order: 0 },
      { id: '20000000-0000-4000-8000-000000000062', label: 'Pack of 2 · Free Delivery', price_pkr: 4300, compare_price: null, free_delivery: true, is_default: false, sort_order: 1 },
    ],
    reviews: [],
  },
];

const vouchers = [
  { code: 'WELCOME10', type: 'percentage', value: 10, min_subtotal: 1000 },
  { code: 'LUOMU15', type: 'percentage', value: 15, min_subtotal: 3000 },
  { code: 'PURE500', type: 'fixed', value: 500, min_subtotal: 2500 },
];

// In-memory order and subscriber store for local (no-Supabase) mode
const orders = [];
const subscribers = new Set();

module.exports = {
  categories,
  allProducts,
  products: allProducts.filter((p) => p.is_active),
  vouchers,
  orders,
  subscribers,
};
