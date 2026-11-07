import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_QTY_PER_LINE } from '../lib/utils';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Open / close drawer
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      // Add item (or increase qty if already in cart)
      addItem: (product, variant = null, qty = 1) => {
        const items = get().items;
        const key = variant ? `${product.id}-${variant.id}` : product.id;

        const existing = items.find((i) => i._key === key);
        if (existing) {
          set({
            items: items.map((i) =>
              i._key === key ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, i.quantity + qty) } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...items,
              {
                _key: key,
                product_id: product.id,
                product_name: product.name,
                product_slug: product.slug,
                primary_image_url: product.primary_image_url,
                unit_price_pkr: variant ? variant.price_pkr : product.price_pkr,
                variant_id: variant?.id || null,
                variant_label: variant?.label || null,
                free_delivery: Boolean(variant?.free_delivery),
                quantity: Math.min(MAX_QTY_PER_LINE, qty),
              },
            ],
            isOpen: true,
          });
        }
      },

      // Update quantity
      updateQty: (key, qty) => {
        if (qty < 1) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) =>
            i._key === key ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, qty) } : i
          ),
        });
      },

      // Remove item
      removeItem: (key) => {
        set({ items: get().items.filter((i) => i._key !== key) });
      },

      // Clear cart
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'luomu-cart',
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export default useCartStore;
