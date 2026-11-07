import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AboutPage from './pages/AboutPage';
import PoliciesPage from './pages/PoliciesPage';
import TrackOrderPage from './pages/TrackOrderPage';
import FaqPage from './pages/FaqPage';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function Layout() {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="app-wrapper">
      {!isCheckout && <Navbar />}
      <CartDrawer />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<CollectionsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<ConfirmationPage />} />
          <Route path="/confirmation/:orderNumber" element={<ConfirmationPage />} />
          {/* Catch-all fallback route */}
          <Route path="*" element={<CollectionsPage />} />
        </Routes>
      </main>
      {!isCheckout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-primary, #1A241C)',
            color: '#FAF8F5',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            fontSize: '13px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#6B8E23',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <Layout />
    </BrowserRouter>
  );
}
