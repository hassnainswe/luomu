import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import {
  formatPrice, deliveryFor, FREE_DELIVERY_THRESHOLD, MAX_QTY_PER_LINE, PLACEHOLDER_IMAGE,
} from '../lib/utils';

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem } = useCartStore();
  const closeRef = useRef(null);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.unit_price_pkr * i.quantity, 0);
  const delivery = deliveryFor(subtotal, items);
  const total = subtotal + delivery;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = delivery === 0 ? 100 : Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  // While open: Escape closes, the page behind doesn't scroll, focus starts on Close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} aria-hidden="true" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title" id="cart-title">
            Your Bag {count > 0 && <span className="cart-drawer__count">({count} {count === 1 ? 'item' : 'items'})</span>}
          </h2>
          <button ref={closeRef} className="cart-drawer__close" onClick={closeCart} aria-label="Close bag">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__body cart-empty">
            <p className="cart-empty__title">Your bag is empty</p>
            <p className="cart-empty__text">Discover our handcrafted oils and scrubs.</p>
            <Link to="/collections" className="btn btn--primary" onClick={closeCart}>Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-ship" aria-live="polite">
              {delivery === 0 ? (
                <p className="cart-ship__text cart-ship__text--done">✓ You&apos;ve unlocked free delivery</p>
              ) : (
                <>
                  <p className="cart-ship__text">
                    You&apos;re <strong>{formatPrice(remaining)}</strong> away from free delivery
                  </p>
                  <p className="cart-ship__hint">Tip: any Pack of 2 always ships free.</p>
                </>
              )}
              <div className="cart-ship__bar" role="progressbar" aria-label="Progress to free delivery"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="cart-drawer__body cart-list">
              {items.map((item) => (
                <li className="cart-item" key={item._key}>
                  <Link to={`/products/${item.product_slug}`} onClick={closeCart} className="cart-item__image-link" tabIndex={-1} aria-hidden="true">
                    <img
                      className="cart-item__image"
                      src={item.primary_image_url || PLACEHOLDER_IMAGE}
                      alt=""
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </Link>

                  <div className="cart-item__info">
                    <div className="cart-item__top">
                      <Link to={`/products/${item.product_slug}`} onClick={closeCart} className="cart-item__name">
                        {item.product_name}
                      </Link>
                      <span className="cart-item__price">{formatPrice(item.unit_price_pkr * item.quantity)}</span>
                    </div>
                    {item.variant_label && <p className="cart-item__variant">{item.variant_label}</p>}
                    {item.quantity > 1 && <p className="cart-item__each">{formatPrice(item.unit_price_pkr)} each</p>}

                    <div className="cart-item__actions">
                      <div className="stepper" role="group" aria-label={`Quantity of ${item.product_name}`}>
                        <button
                          type="button"
                          onClick={() => updateQty(item._key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item._key, item.quantity + 1)}
                          disabled={item.quantity >= MAX_QTY_PER_LINE}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button
                        type="button"
                        className="cart-item__remove"
                        onClick={() => removeItem(item._key)}
                        aria-label={`Remove ${item.product_name} from bag`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-drawer__row">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'cart-drawer__free' : undefined}>
                  {delivery === 0 ? 'Free' : formatPrice(delivery)}
                </span>
              </div>
              <div className="cart-drawer__total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link to="/checkout" className="btn btn--primary btn--full btn--lg" onClick={closeCart}>
                Checkout · {formatPrice(total)}
              </Link>
              <button type="button" className="cart-drawer__continue" onClick={closeCart}>
                Continue shopping
              </button>
              <p className="cart-drawer__note">Cash on delivery available · Delivered in 4–8 working days</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
