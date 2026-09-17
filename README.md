# Elmanssa Education Platform

A full-featured, Arabic-first (RTL) online learning platform connecting students, teachers, and administrators — from course marketplace and secure video lessons to payments, analytics, and an AI study assistant.

## Overview

Elmanssa ("المنصة" — *The Platform*) is a production-grade learning management system built for the Arabic-speaking market (Egypt and Saudi Arabia). It serves three audiences through dedicated role-based experiences: **students** who browse, purchase, and watch structured video courses while tracking their progress; **teachers** who author multi-level curricula, upload media, and manage their students and revenue; and **admins** who oversee the entire platform — users, courses, enrollments, orders, and accounting. The frontend is a fast, code-split React SPA deployed on Vercel, backed by a REST API (`/api/v1`) served by the Elmanssa ASP.NET Core (.NET) backend.

## ✨ Features

- **Role-based platform** — separate student, teacher, and admin dashboards with JWT authentication, refresh-token rotation, email verification, and route-level role guards.
- **Course marketplace** — browse, search, and filter courses ("subjects") with rich detail pages, multi-level curriculum (levels → lectures), ratings, and reviews.
- **Student learning dashboard** — enrollments, per-lecture progress tracking (watch time + completion), and in-app notifications.
- **Teacher dashboard** — create and manage subjects with nested curriculum, publish/draft workflow, student roster, analytics, and personal accounting.
- **Admin dashboard** — platform-wide oversight of students, teachers, courses, enrollments, orders, streams, and users, plus accounting with CSV export.
- **Secure video learning** — HLS streaming via hls.js with signed stream tokens, watermark and screen-protection, Plyr player, YouTube/Google Drive embeds, lecture transcripts, and progress sync.
- **Media upload pipeline** — video/document upload with server-side compression (FFmpeg H.265 + GZip), batch and parallel uploads, and HLS transcoding readiness polling.
- **Payments** — checkout flow with coupon validation and Paymob payment-gateway integration, including success/failure handling.
- **AI study assistant** — chat interface with markdown rendering and conversation history, powered by the backend AI endpoints (Gemini).
- **Accounting module** — income/expense tracking for admins and teachers, SAR/EGP currency detection, and offline localStorage fallback that syncs to the backend.
- **Marketing site** — home (hero, stats, features, popular courses, testimonials), about, blog, pricing, support, privacy, contact, and instructor profile pages.
- **Performance & security** — route-level code splitting with hover prefetching, short-TTL GET caching, input sanitization and XSS protection, and per-course social-preview (Open Graph) generation.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript |
| Build tooling | Vite 6, @vitejs/plugin-react |
| Styling | Tailwind CSS 3 (custom brand design tokens, Cairo font) |
| Video playback | hls.js (HLS streaming), Plyr (player UI) |
| State management | React Context API (`AuthContext`, `ToastContext`) + custom hooks |
| Data fetching | Native `fetch` wrapper with JWT refresh, single-flight token refresh, and in-memory GET caching |
| Routing | Custom URL ↔ page mapping on `history.pushState`/`popstate` (no router library) |
| Testing | Vitest, Testing Library (jest-dom, user-event), jsdom |
| Payments | Paymob (via backend `/payment/create`) |
| AI assistant | Google Gemini (via `GEMINI_API_KEY` env) |
| Deployment | Vercel (SPA rewrites + `/api/v1` proxy) |

## 🚀 Getting Started

**Prerequisites:** Node.js 18+ and npm. The app talks to the Elmanssa API — for local development the Vite dev server proxies `/api/v1` to `http://localhost:5299` (the .NET backend), so a running backend instance is expected for full functionality.

```bash
# 1. Install dependencies
npm install

# 2. Configure the API base URL (already provided in .env)
#    VITE_API_URL=http://localhost:5299/api/v1

# 3. Start the dev server (http://localhost:3000)
npm run dev

# 4. Run tests
npm test            # single run
npm run test:watch  # watch mode

# 5. Production build
npm run build                 # Vite production build
npm run build:full            # build + generate per-course OG preview pages
npm run preview               # preview the production build locally
```

## 📁 Project Structure

```
elmanssa-education-platform/
├── App.tsx                 # Root component: URL↔page routing, role guards, lazy loading
├── index.tsx               # Entry point — mounts app with Auth + Toast providers
├── index.html              # RTL Arabic shell with SEO/OG meta tags and Cairo font
├── api/                    # Typed REST API modules (auth, courses, teacher, student,
│                           #   admin, media, orders, streams, ai, accounting, content)
├── components/             # Feature components: pages, dashboards, video player,
│   │                       #   checkout, media gallery, marketing sections
│   └── teacher/            # Teacher-dashboard sub-components (subjects, lectures, analytics)
├── config/                 # API base URL configuration
├── contexts/               # AuthContext (JWT session) + ToastContext
├── docs/                   # Architecture, integration, and security documentation
├── hooks/                  # useAuth hook
├── public/                 # Static assets (logo, OG image, course images)
├── scripts/                # generate-course-og.mjs — per-course social preview generator
├── services/               # Higher-level service layer (auth, payment, API helpers)
├── src/test/               # Vitest setup and tests
├── types/                  # Shared TypeScript types (Course, API DTOs)
├── utils/                  # Validation, sanitization, and token storage utilities
├── .env / .env.production  # VITE_API_URL per environment
├── vercel.json             # Vercel rewrites: /api/v1 → backend, SPA fallback
├── vite.config.ts          # Vite config (dev proxy, chunk splitting, Gemini env)
└── tailwind.config.js      # Brand design tokens (colors, fonts, animations)
```

## 🔗 Backend / API

The frontend is a pure SPA that consumes a REST API under the `/api/v1` prefix. The API base URL is injected at build time via the `VITE_API_URL` environment variable:

- **Development** (`.env`): `http://localhost:5299/api/v1` — proxied by the Vite dev server.
- **Production** (`.env.production`): `https://api.elmanssa.com/api/v1`.
- **Vercel** (`vercel.json`): rewrites `/api/v1/*` to `https://elmanasa-edu.runasp.net/api/v1/*`, the deployed Elmanssa ASP.NET Core (.NET) service.

The backend (a separate repository, referenced throughout `docs/`) is an ASP.NET Core service using PostgreSQL with Entity Framework Core, JWT access/refresh tokens, Paymob payment processing, and an FFmpeg/HLS media pipeline. The frontend integrates with it through typed modules in `api/` covering auth, courses/subjects, teacher and student dashboards, admin management, media streaming, orders/payments, live streams, AI conversations, and accounting.

**Environment variables used by this repo:**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | REST API base URL (e.g. `https://api.elmanssa.com/api/v1`) |
| `GEMINI_API_KEY` | API key for the AI assistant (injected at build time) |
| `OG_BASE_URL` | Canonical site origin for the OG-preview build script (default `https://elmanssa.com`) |
| `OG_IMAGE_URL` | Fallback preview image for the OG-preview build script |

## 🗺 Current Status

The platform is feature-complete for its core learning loop — marketplace, enrollment, secure video playback, progress tracking, payments, and all three role dashboards — and is deployed to production (frontend on Vercel, backend on runasp.net). The `docs/` folder documents the architecture and integration in depth, including a backend integration blueprint, the chunked video streaming and compression systems (marked production-ready), and security hardening analyses. The live-streaming page is currently a "coming soon" placeholder, and the accounting module falls back to localStorage when the backend endpoints are unavailable.

---

*This README was generated from the codebase. For detailed architecture and integration notes, see the [`docs/`](docs/) directory.*