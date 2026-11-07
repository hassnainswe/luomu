/**
 * Format a PKR price integer to display string
 * e.g. 2850 → "PKR 2,850"
 */
export const formatPrice = (pkr) => {
  if (pkr == null) return '';
  return `PKR ${pkr.toLocaleString('en-PK')}`;
};

/**
 * Truncate text to a max length
 */
export const truncate = (str, max = 80) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

/**
 * Generate star array for ratings
 */
export const getStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};

/**
 * Format order number display
 */
export const formatOrderNumber = (num) => num?.toUpperCase() || '';

// Must match backend/src/controllers/orderController.js — the server's figure is what gets charged.
export const FREE_DELIVERY_THRESHOLD = 4000;
export const DELIVERY_FEE = 250;
export const MAX_QTY_PER_LINE = 20; // server rejects more per line
// Free at the threshold, or whenever the bag holds a Pack of 2.
export const deliveryFor = (subtotal, items = []) =>
  subtotal >= FREE_DELIVERY_THRESHOLD || items.some((i) => i.free_delivery) ? 0 : DELIVERY_FEE;

export const PLACEHOLDER_IMAGE = '/images/products/oil-trio-linen.jpg';

// WhatsApp Business number: digits only, with country code (e.g. 923001234567). Set VITE_WHATSAPP_NUMBER.
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '923205727217').replace(/\D/g, '');
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5)}`;
// Pre-typed messages so customers just tap Send.
export const WA_GENERAL = 'Hi LUOMU! I have a question about your products.';
export const WA_CONSULT =
  "Hi LUOMU! I'd like some advice on which product is right for me.\n\nMy concern is: ";
export const whatsappLink = (text = WA_GENERAL) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const CONTACT_EMAIL = 'luomu.organics@gmail.com';

export const SHIPPING_POLICY = 'Delivery in 4–8 working days across Pakistan.';
export const RETURNS_POLICY = 'No returns or exchanges unless you receive a wrong or damaged item.';
