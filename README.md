# LUOMU Botanical Apothecary — Full-Stack E-Commerce Platform

A luxury botanical skincare e-commerce website inspired by Scandinavian minimalism and wild-harvested Himalayan botanicals (Swat Valley & Hunza). Built with high coding standards, responsive design, end-to-end checkout flow, and production readiness.

---

## 🌟 Tech Stack

- **Frontend**: React 19, Vite, React Router 7, Zustand (cart persistence), Axios, React Hot Toast, Vanilla CSS Design System.
- **Backend**: Node.js, Express, Helmet, CORS, Morgan, Supabase JS SDK.
- **Database**: Supabase PostgreSQL with UUIDv4, Row Level Security (RLS), full schema migrations, indices, and seed data.
- **Resilience**: Full offline/mock fallback layer so the application runs seamlessly out-of-the-box before or after Supabase credentials are configured.

---

## 📁 Repository Structure

```
Luomu/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase client & environment configuration
│   │   ├── controllers/     # Products, categories, and order business logic
│   │   ├── data/            # High-fidelity fallback seed dataset
│   │   ├── routes/          # Express route definitions
│   │   └── index.js         # API entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, CartDrawer, ProductCard, Footer, ScrollToTop
│   │   ├── lib/             # API client with offline resilience, utility formatters
│   │   ├── pages/           # HomePage, CollectionsPage, ProductPage, CheckoutPage, ConfirmationPage
│   │   ├── store/           # Zustand cart store with localStorage sync
│   │   ├── App.jsx          # Route orchestration & toast notifications
│   │   └── index.css        # Luxury typography, spacing tokens, animations
│   ├── .env.example
│   └── package.json
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Complete database schema, RLS policies & seeds
```

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```
> The API will boot on `http://localhost:5000`.

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
> The web application will boot on `http://localhost:5173`.

---

## 🗄️ Supabase Setup & Production Database

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Copy and run the entire script in [`supabase/migrations/001_initial_schema.sql`](file:///d:/Code/Luomu/supabase/migrations/001_initial_schema.sql).
4. In your Supabase Project Settings → **API**, copy:
   - **Project URL**
   - **service_role key** (secret)
   - **anon key** (public)
5. Add them to `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```
6. Add your public URL & anon key to `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🛒 Features Implemented

1. **Brand Identity & Aesthetics**: Editorial typography, olive/charcoal luxury palette, botanical micro-interactions, responsive grid.
2. **Catalog & Filters**: Filter by botanical categories (*Skin Care Sanctuary*, *Hair & Scalp*, *Body & Salves*, *Ritual Tools*), skin concern tags (*Barrier Repair*, *Deep Hydration*, *Fine Lines*), and geographic origin (*Swat Valley*, *Hunza*, *Gilgit*, *Skardu*).
3. **Product Detail Experience**: Multi-angle image gallery, size variant selection (50g jar, 100g double, gift set), real-time price updates, accordion tabs (*Key Ingredients*, *How to Ritualize*, *Extraction Ethics*), customer reviews, and related pairings.
4. **Interactive Cart Drawer**: Real-time quantity adjustments, free shipping progress bar (threshold: PKR 3,500), persistent storage across browser refreshes.
5. **Checkout & Order Dispatch Flow**:
   - Accelerated payment options (JazzCash, Easypaisa, Cash on Delivery, Bank Transfer).
   - Nationwide Pakistani address fields with province and city selector.
   - Voucher code engine (e.g. `WELCOME10`, `LUOMU15`).
   - Order confirmation dispatch pipeline with invoice snapshot and WhatsApp concierge link.
