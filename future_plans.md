# Zenaris — Full App README

This document outlines the **production-ready plan** for a full-stack product: **Web (Vite + React 19 + Tailwind v4)**, **Mobile (React Native + Expo)**, and an optional **Backend**. The goals are **performance**, **sustainability**, **great DX**, and a visibly **professional** setup.React Native Expo mobile app can be built rapidly and stand up a backend when needed.

---

## Table of Contents

* [1) Goals](#1-goals)
* [2) Tech Choices (Summary)](#2-tech-choices-summary)
* [3) Monorepo Layout](#3-monorepo-layout)
* [4) Web App (Vite + React)](#5-web-app-vite--react)
* [5) Mobile App (React Native + Expo)](#6-mobile-app-react-native--expo)
* [6) Backend Options](#7-backend-options)
* [7) Data Layer (API, Query, Forms)](#8-data-layer-api-query-forms)
* [8) Performance Strategy](#9-performance-strategy)
* [9) Testing & Quality](#10-testing--quality)
* [10) Monitoring & Analytics](#11-monitoring--analytics)
* [11) i18n](#12-i18n)
* [12) PWA & Distribution](#13-pwa--distribution)
* [13) CI/CD & Budgets](#14-cicd--budgets)
* [14) Security & Env](#15-security--env)
* [15) Fast-Track Plan](#17-fast-track-plan)

---

## 1) Goals

* **Fast UX**: lazy routes, image optimizations, cache-first data.
* **Maintainable**: feature-oriented structure, strong typing, tests.
* **Professional**: error/perf monitoring, analytics, size budgets, CI/CD.

---

## 2) Tech Choices (Summary)

**Core Web**

* Dev/Build: **Vite**
* UI: **React 19**, **Tailwind CSS v4**, **Radix Primitives**, **lucide-react**
* Animation: **framer-motion**
* Router: **TanStack Router** (typed) *(alt: React Router)*
* Server state: **@tanstack/react-query**
* Forms: **react-hook-form** + **zod** OR **formik**

**Mobile (Expo)**

* Framework: **React Native + Expo** 
* Routing: **Expo Router**
* Styling: **React Native Paper**
* Animations/Gestures: **react-native-reanimated**, **react-native-gesture-handler**
* Storage/Security: **expo-secure-store** (tokens), **MMKV** (fast key‑value)
* Notifications/Links: **Expo Notifications**, deep links via **expo-linking**
* Builds/OTA: **EAS Build/Submit**, **Expo Updates**

**Backend**

* **NestJS** (opinionated, enterprise‑ready) or **Express**
* DB: **PostgreSQL** OR / **MongoDB**
* Auth: **Custom** OR **Supabase Auth**
* File Storage: **S3-compatible** (Cloudflare R2/AWS S3) OR **Azure**
* Queue/Jobs: **BullMQ + Redis** (emails, webhooks, heavy tasks)

**DX & Quality**

* Tests: **Vitest** + **Testing Library** / **expo-mock** where needed
* Lint/Format: **ESLint** (+ jsx-a11y) + **Prettier**
* Bundle analysis: **rollup-plugin-visualizer**, budget via **size-limit**
* Type/ESLint overlay: **vite-plugin-checker**

**Media & Perf (Web)**

* Images: **vite-imagetools**
* SVG → React: **vite-plugin-svgr**
* Long lists: **react-virtuoso** (if needed)

**Monitoring & Analytics**

* Errors/Perf: **Sentry** (web + React Native)
* Analytics: **PostHog**

**PWA (Web)**

* **vite-plugin-pwa** (installable + offline)

---

## 3) Monorepo Layout

> Optional but recommended for shared types and UI.

```
zenaris/
  apps/
    web/        # Vite + React
    mobile/     # Expo app
    backend/    # NestJS/Fastify service (optional)
  packages/
    ui/         # shared UI primitives (web/mobile if Tamagui)
    config/     # ESLint/TS/Prettier configs
    types/      # shared zod schemas & TS types
```

* **pnpm workspaces** + (optional) **Turborepo** for caching and pipelines.

---
---

## 4) Web App (Vite + React)

* Providers: React Query + Router + Theme (dark/light via CSS vars)
* UI System: Tailwind v4 + Radix + CVA (`class-variance-authority`) + `tailwind-merge`
* Code-splitting: lazy routes, shared vendor chunks
* Assets: imagetools for responsive images, svgr for inline SVG
* Error boundaries with `react-error-boundary`
* A11y baseline via `eslint-plugin-jsx-a11y`


## 5) Mobile App (React Native + Expo)

* **Expo Router** for file‑based navigation
* **React Native Paper** for consistent design tokens
* **React Query** for server state (persist cache to MMKV when offline)
* **Auth**: token in `expo-secure-store`, refresh flow with background tasks
* **Media**: `expo-image-picker`, `expo-camera`; permission guards
* **OTA**: Expo Updates for instant bugfixes
* **Build/Release**: EAS Build/Submit; release channels (prod, staging)
* **Crash/Perf**: Sentry RN SDK; sourcemaps uploaded during EAS builds

## 6) Backend Options

**A. NestJS/Express** 

* Modules: Auth, Users, Files, Notifications
* Prisma + PostgreSQL; Zod DTO validation or class‑validator
* REST + OpenAPI; optional tRPC gateway for typed clients
* Background jobs: BullMQ + Redis
* Storage: S3 (R2 for low cost)
* Email/SMS: Resend/Twilio
* Deploy: Fly.io/Render/Railway/Azure; containerized with Docker


## 7) Data Layer (API, Query, Forms)

* Query keys: `[domain, resource, params]`
* `staleTime`: long for read‑mostly lists; invalidate on mutation
* Prefetch critical data on route transitions
* Optimistic updates for responsive UX
* Forms: RHF + Zod resolvers; all schemas live in `packages/types` to share across apps

---

## 8) Performance Strategy

* Route‑level code splitting; `manualChunks` for vendor separation
* Link hover prefetch (`modulepreload`) for hot paths
* Images: responsive `<picture>` via imagetools; WebP/AVIF
* Virtualize long lists (react-virtuoso)
* Memoization only when measured (avoid premature `useMemo`/`useCallback`)

---

## 9) Testing & Quality

* Unit/Component (web): Vitest + Testing Library; MSW for network
* Mobile: component tests with Testing Library RN; mock native modules
* E2E (optional): Playwright (web) / Maestro or Detox (mobile)
* Bundle Analysis: visualizer → `stats.html`
* Size Budgets: **size-limit** in CI

---

## 10) Monitoring & Analytics

* **Sentry**: errors + performance + session replay (web), errors & perf (RN)
* **PostHog**: funnels, events, experiments; respect privacy by default

---

## 11) i18n

* **react-i18next** for web; **i18next** on mobile (shared translations in `packages/types` if desired)
* Lazy loaded namespaces; per‑route bundles for translations

---

## 12) PWA & Distribution

* Web: `vite-plugin-pwa` (manifest + offline cache)
* Hosting: Vercel/Netlify for SPA; or Nginx with `try_files $uri /index.html;`
* Mobile: EAS channels (staging/prod); OTA rollouts with gradual %

---

## 13) CI/CD & Budgets

**GitHub Actions**

* Jobs: typecheck → lint → tests → build → size → upload sourcemaps (Sentry)
* Artifacts: build outputs, `stats.html`

**EAS**

* Build profiles (dev, preview, production)
* Automatically upload sourcemaps to Sentry

---

## 14) Security & Env

* Only expose `VITE_`/`EXPO_PUBLIC_` prefixed vars to clients
* Secrets live in CI/hosting; never commit `.env`
* Web CSP: restrict `script-src`, `connect-src` (API/Sentry/analytics)
* Mobile: tokens in SecureStore; avoid logging PII
* Backend: OWASP best practices, rate‑limits, input validation, audit logs

---

## 15) Fast-Track Plan

**48–72h MVP** (depending on scope):

1. **Web shell**: Router + Providers + basic UI (Button/Input/Modal)
2. **Mobile shell** (Expo): Router + Auth screens; OTA ready
3. **Backend stub**: Auth + Users + simple CRUD; OpenAPI published
4. **Sentry + Analytics** wired
5. **CI/CD**: GitHub Actions + EAS profiles; size budgets enabled

This stack demonstrates:

* **Measurability** (Sentry, analytics, size-limit)
* **Scalability** (feature‑first structure, shared types)
* **Quality** (tests, lint, strong typing)
* **Performance** (code‑split, optimized assets, virtualization)
* **Speed to ship** (Expo OTA + EAS + Vite dev speed)
