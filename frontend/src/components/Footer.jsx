import { useState } from 'react';
import { newsletterAPI } from '../lib/api';
import { WHATSAPP_DISPLAY, whatsappLink, CONTACT_EMAIL } from '../lib/utils';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await newsletterAPI.subscribe(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <div className="footer__brand-name">Luomu</div>
            <p className="footer__brand-desc">
              The science behind natural wellness. Handcrafted, 100% natural and
              vegan hair and body care — free from sulfates, parabens and silicones.
            </p>
            <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
              <br />
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'inherit' }}>{CONTACT_EMAIL}</a>
            </p>
          </div>

          {/* Boutique */}
          <div>
            <p className="footer__col-title">Boutique</p>
            <ul className="footer__links">
              <li><a href="/collections" className="footer__link">All Formulations</a></li>
              <li><a href="/collections?category=hair-scalp" className="footer__link">Hair & Scalp</a></li>
              <li><a href="/collections?category=body-care" className="footer__link">Body Care</a></li>
            </ul>
          </div>

          {/* Philosophy */}
          <div>
            <p className="footer__col-title">LUOMU</p>
            <ul className="footer__links">
              <li><a href="/about" className="footer__link">Our Story</a></li>
              <li><a href="/track" className="footer__link">Track Your Order</a></li>
              <li><a href="/faq" className="footer__link">FAQ</a></li>
              <li><a href="/policies" className="footer__link">Shipping, Returns & Payment</a></li>
              <li><a href={whatsappLink()} target="_blank" rel="noreferrer" className="footer__link">WhatsApp Us</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className="footer__link">Email Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="footer__col-title">The Botanical Dispatch</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 4 }}>
              Receive notes on seasonal harvests, therapeutic preparations, and
              invitations to slow apothecary releases.
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
              We honor your stillness. No aggressive promotions.
            </p>
            <form className="footer__newsletter-input" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                aria-label="Email address"
              />
              <button type="submit" disabled={status === 'loading' || status === 'success'}>
                {status === 'loading' ? '…' : status === 'success' ? '✓' : 'Join'}
              </button>
            </form>
            {status === 'success' && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                Welcome to the apothecary.
              </p>
            )}
            {status === 'error' && (
              <p style={{ fontSize: 11, color: '#ff8a8a', marginTop: 6 }}>
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} LUOMU. Crafted with respect for nature • Pakistan</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/policies#shipping" className="footer__link" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Shipping & Returns</a>
            <a href="/policies#privacy" className="footer__link" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Privacy</a>
          </div>
          <div className="footer__payment-icons">
            <span>Cash on Delivery</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span>JazzCash</span>
            <span>EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
