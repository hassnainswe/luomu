import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const Chevron = ({ open }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Shop menu; add Face Care once a face product is live.
const SHOP_LINKS = [
  { label: 'All Products', to: '/collections' },
  { label: 'Hair & Scalp', to: '/collections?category=hair-scalp' },
  { label: 'Body Care', to: '/collections?category=body-care' },
];

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const { pathname, search } = useLocation();
  const here = pathname === '/shop' ? `/collections${search}` : pathname + search;
  const inShop = pathname === '/collections' || pathname === '/shop' || pathname.startsWith('/products/');

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Hover opens it for mouse users only; on touch, a tap toggles it.
  const hover = (value) => (e) => { if (e.pointerType === 'mouse') setOpen(value); };

  return (
    <>
      <div className="announcement-bar">
        Complimentary delivery across Pakistan on orders over PKR 4,000 or any Pack of 2 &nbsp;•&nbsp; Cash on Delivery Available
      </div>
      <nav className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            <span className="nav__logo-name">Luomu</span>
            <span className="nav__logo-tagline">Natural Science · Pure Harvest</span>
          </Link>

          <div className="nav__links">
            <div className="nav__dropdown" ref={menuRef} onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
              <button
                type="button"
                className={`nav__link nav__dropdown-toggle${inShop ? ' active' : ''}`}
                aria-expanded={open}
                aria-controls="shop-menu"
                // A mouse click after hover-open must not close it; taps and Enter toggle.
                onClick={(e) => setOpen((o) => (e.nativeEvent.pointerType === 'mouse' ? true : !o))}
              >
                Shop <Chevron open={open} />
              </button>
              {open && (
                <ul id="shop-menu" className="nav__menu">
                  {SHOP_LINKS.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className={here === l.to ? 'active' : undefined}
                        aria-current={here === l.to ? 'page' : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link to="/about" className={`nav__link${pathname === '/about' ? ' active' : ''}`}
              aria-current={pathname === '/about' ? 'page' : undefined}>
              Our Story
            </Link>
          </div>

          <div className="nav__actions">
            <button
              className="nav__action-btn"
              aria-label="Cart"
              onClick={toggleCart}
            >
              <CartIcon />
              {totalQty > 0 && (
                <span className="nav__cart-count">{totalQty}</span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
