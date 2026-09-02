# Luxury Car Showroom Website — Build Plan

## Context

`d:\car-site` এখন সম্পূর্ণ খালি। এখানে একটা luxury car showroom-এর prototype website বানাতে হবে।

- **Structure/feature reference:** https://vipmotors.ae/ — top utility bar (location + phone + socials), তার নিচে main nav, hero, inventory search, featured cars।
- **Aesthetic/animation reference:** https://www.elliotjames.com/ — restrained luxury: প্রচুর whitespace, slow mask-reveal, ছবিই নায়ক, কোনো loud animation নেই। এটা **অনুপ্রেরণা, copy নয়** — landing page-এর মেজাজ এখান থেকে, structure VIP Motors থেকে।

VIP Motors থেকে যা **বাদ**: Sell a Car, News, Our Services।

**লক্ষ্য:** একটা কাজ করা prototype — public site থেকে গাড়ি ব্রাউজ/ফিল্টার/কম্পেয়ার করা যাবে, আর একটা minimal admin panel থেকে শুধু গাড়ি ও তার details upload/edit করা যাবে। বাকি সব content (About, Contact, Governing Body, 360 image) কোডেই static থাকবে।

---

## Decisions (confirmed)

| বিষয় | সিদ্ধান্ত |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | **TypeScript (`.tsx`)**, `strict: true` |
| Styling | **CSS Modules only** — প্রতি component-এর নিজস্ব `.module.css`। Tailwind নেই |
| Animation | GSAP + ScrollTrigger, Framer Motion. **Lenis বাদ** (ব্যবহারকারীর নির্দেশে) — smooth scroll এখন native CSS `scroll-behavior` |
| Database | Supabase — **এই সাইটের জন্য নতুন আলাদা project** |
| Region | **Mumbai (`ap-south-1`)** — UAE দর্শকের সবচেয়ে কাছে |
| DB schema | `public` (নিজস্ব project, তাই আলাদা schema-র দরকার নেই) |
| Map | Leaflet + OpenStreetMap (ফ্রি, API key লাগে না, dark-themed) |
| Admin auth | Supabase magic link (email OTP) + `admin_members` email whitelist |
| Admin email | `rhythm4538@gmail.com` (আপাতত একমাত্র admin) |
| Auth email | Custom SMTP — **Resend** (built-in SMTP-এর rate limit এড়াতে) |
| 360 view | Format এখনো ঠিক হয়নি → placeholder page, পরে viewer বসবে |

---

## Supabase — যা জানা দরকার

আলাদা project নেওয়ায় auth, key, migration, email template — সব isolated। পুরোনো app ভাঙার ঝুঁকি শূন্য।

**তবে একটা জিনিস তবুও শেয়ার হয়:** Free plan-এ storage/egress/MAU quota **organization-level**, project-level নয়।

| Resource | Free tier | Scope |
|---|---|---|
| Database size | 500 MB | প্রতি project আলাদা ✅ |
| File storage | 1 GB | পুরো org মিলে ভাগ ⚠️ |
| Egress | 5 GB uncached + 5 GB cached | পুরো org মিলে ভাগ ⚠️ |
| Active projects | ২টা | প্রতি org (এটাই হবে দ্বিতীয়) |

**Storage হিসাব:** VIP Motors-এর মাপে ~৬০ গাড়ি × ১৫ ছবি = ৯০০ ছবি। WebP-তে গড়ে ৪০০ KB → **~৩৬০ MB**। ১ GB pool-এ কুলাবে।

**আসল চাপ egress।** প্রতিকার (Phase 9-এ, কিন্তু শুরু থেকেই মাথায়):
- সব ছবি Next.js `<Image>` দিয়ে — AVIF/WebP + সঠিক `sizes`
- Hero video `preload="metadata"`, poster image সহ
- Upload-এর সময় admin panel-এই ছবি resize/compress (মূল ফাইল যেন সরাসরি না যায়)

---

## Architecture Rules (এগুলো কঠোরভাবে মানা হবে)

1. **`app/**/page.tsx` কখনো `"use client"` নয়** — সব page Server Component।
2. Page-এর কাজ শুধু দুইটা: `lib/services/*` থেকে service call করা, আর component-কে props দিয়ে render করা। Page-এ কোনো business logic বা fetch logic লেখা হবে না।
3. সব data access `lib/services/` এ। Supabase client সরাসরি কোনো component/page-এ import হবে না — শুধু service-এর ভিতরে।
4. **এক component = এক ফোল্ডার:**
   ```
   components/common/CarCard/
     ├── CarCard.tsx
     ├── CarCard.module.css
     └── index.ts        ← re-export, যাতে import path পরিষ্কার থাকে
   ```
5. `"use client"` শুধু সেই component ফাইলে যার interactivity দরকার (navbar, filter, gallery, map, compare)। Client boundary যতটা সম্ভব leaf-এর কাছে।
6. **Common vs page-specific:** একাধিক জায়গায় ব্যবহার হয় → `components/common/`। এক page-এর নিজস্ব → `components/<page-name>/`।
7. কোনো hardcoded value component-এ নয় — color/spacing/font `styles/variables.css` এর CSS custom property থেকে, static copy `src/data/` থেকে।
8. **Types:** DB types `supabase gen types typescript` দিয়ে generate করে `src/types/database.ts` এ। App-level type (`Car`, `CarWithImages`, `CarFilters`) generated type থেকে derive করা — হাতে ডুপ্লিকেট লেখা হবে না। `any` নেই।

---

## Folder Structure

```
d:\car-site\
├── plan.md
├── package.json
├── tsconfig.json                 ← strict: true, "@/*" alias
├── next.config.ts
├── src/proxy.ts                  ← Supabase session refresh + /admin গার্ড (Next.js 16: middleware.ts → proxy.ts)
├── .env.local / .env.local.example
├── supabase/
│   ├── schema.sql                ← tables + indexes
│   ├── policies.sql              ← RLS
│   └── seed.sql                  ← admin + demo cars
├── public/
│   ├── videos/hero.mp4           ← ব্যবহারকারীকে যোগ করতে হবে
│   └── images/
└── src/
    ├── app/
    │   ├── layout.tsx            ← fonts, metadata (metadataBase), globals.css
    │   ├── globals.css
    │   ├── sitemap.ts  |  robots.ts  |  opengraph-image.tsx
    │   ├── (site)/                          ← public-facing route group, its own layout (TopBar/Navbar/Footer/providers)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx                     → Home
    │   │   ├── loading.tsx | error.tsx | not-found.tsx
    │   │   ├── inventory/page.tsx           → filter + grid
    │   │   ├── inventory/[slug]/page.tsx    → car detail
    │   │   ├── categories/[category]/page.tsx
    │   │   ├── about-us/page.tsx
    │   │   ├── governing-body/page.tsx
    │   │   ├── contact-us/page.tsx
    │   │   ├── 360-view/page.tsx            → placeholder
    │   │   └── compare/page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx                    → minimal shell, NO public chrome
    │   │   ├── login/page.tsx
    │   │   └── (dashboard)/
    │   │       ├── layout.tsx                → AdminNav
    │   │       ├── page.tsx                  → car list
    │   │       └── cars/new, cars/[id]/page.tsx
    │   ├── auth/callback/route.ts            → magic link exchange
    │   └── actions/                          → server actions (car CRUD, image upload, login, contact form)
    │
    ├── components/                (common/, home/, inventory/, car-detail/, compare/, about/, governing-body/, contact/, viewer-360/, admin/)
    ├── lib/                       (supabase/, services/, constants.ts, animations.ts, utils/, site-url.ts)
    ├── types/                     (database.ts, car.ts)
    ├── data/                      (navigation.ts, site.ts, about.ts, contact.ts, governingBody.ts — static content)
    ├── providers/                 (CompareProvider.tsx)
    └── styles/                    (variables.css, typography.css)
```

**একটা গুরুত্বপূর্ণ পরিবর্তন মূল প্ল্যান থেকে:** admin panel-কে public site-এর Navbar/Footer/TopBar-এর ভিতরে রাখা হয়নি — সেটা luxury nav-কে গাড়ির CRUD form-এর উপর ভাসিয়ে রাখত, যা "minimal admin" চাহিদার পরিপন্থী। তাই public route গুলো `(site)` route group-এ সরিয়ে নিজস্ব layout দেওয়া হয়েছে, আর `/admin` সম্পূর্ণ আলাদা, নিজস্ব ন্যূনতম `AdminNav` নিয়ে।

---

## Database Schema

**`admin_members`** — `id`, `email` (unique), `name`, `created_at`
এই টেবিলে যে email আছে শুধু সে-ই admin panel-এ ঢুকতে পারবে। Seed: `rhythm4538@gmail.com`

**`cars`** — মূল টেবিল
`id`, `slug` (unique), `make`, `model`, `year`, `trim`, `price`, `currency` (default `AED`), `status` (`available` | `reserved` | `sold`), **`categories text[]`** (একটা গাড়ি একাধিক inventory-তে থাকতে পারে), `mileage`, `exterior_color`, `interior_color`, `transmission`, `fuel_type`, `engine`, `horsepower`, `drivetrain`, `body_type`, `doors`, `seats`, `vin`, `description`, `features text[]`, `is_featured`, `sort_order`, `created_at`, `updated_at`

**`car_images`** — `id`, `car_id` (FK cascade), `url`, `storage_path`, `alt`, `sort_order`, `is_cover`

**`inquiries`** — `id`, `car_id` (nullable), `name`, `email`, `phone`, `message`, `created_at`
Contact form ও car inquiry এখানে জমা হবে যাতে কিছু হারায় না। v1-এ এর কোনো admin UI নেই।

**Categories (fixed union type):** `upcoming_units`, `port_units`, `showroom_stocks`, `exchange_offers`, `pre_orders`

**Indexes:** `cars(slug)`, `cars(make, model)`, `cars(year)`, `cars(price)`, `cars(status)`, GIN on `cars(categories)`, `car_images(car_id, sort_order)`

**Storage bucket:** `car-images` — public read, admin write।

**RLS (সব টেবিলে চালু):**
- `cars`, `car_images` → anon `SELECT`; `INSERT/UPDATE/DELETE` শুধু `is_admin()` হলে
- `is_admin()` = security-definer function, `auth.jwt()->>'email'` কে `admin_members`-এর সাথে মেলায়
- `inquiries` → anon `INSERT`, `SELECT` শুধু admin
- `admin_members` → শুধু admin পড়তে পারবে

**Admin access — ৩ স্তর:**
1. Magic link পাঠানোর **আগে** `admin_members`-এ email আছে কিনা চেক — না থাকলে পাঠানোই হয় না (`shouldCreateUser: true` কিন্তু whitelist gate-এর পরে, তাই কার্যত non-admin কখনো user হিসেবে তৈরিই হয় না)
2. `src/proxy.ts` `/admin/*` এ session + admin-status যাচাই করে (কোড করা ও যাচাই করা হয়েছে — নিচে দেখুন)
3. RLS — কোনোভাবে session পেলেও DB write আটকে যাবে

---

## Animation Plan

**Foundation:** Lenis বাদ দেওয়া হয়েছে। Smooth scroll এখন `html { scroll-behavior: smooth }` — GSAP ScrollTrigger native scroll-এর সাথেই কাজ করে, কোনো sync লাগে না।

**সবচেয়ে জরুরি নিয়ম — start state CSS-এ থাকতে হবে:** আগে animation "চলছিল" কিন্তু দেখা যাচ্ছিল না, কারণ server render করে element-কে **final position-এ** এঁকে দিত; তারপর hydrate হয়ে GSAP সেই একই জায়গায় "animate" করত — চোখে কিছুই ধরা পড়ত না। এখন প্রতিটা animated element-এর লুকানো start state CSS-এ (বা inline style-এ) দেওয়া, যাতে প্রথম paint-এই সেটা লুকানো থাকে আর GSAP-এর সত্যিই animate করার কিছু থাকে।

| কোথায় | কী |
|---|---|
| Hero intro | GSAP timeline — video 1.14→1 scale, overlay fade, eyebrow/heading/tagline/CTA/scroll-cue staggered entrance |
| Hero scroll | video receding (opacity + scale) আর content -80px drift — অগভীর depth effect |
| Section heading | লাইন-বাই-লাইন mask reveal — `RevealText` |
| Car card | clip-path reveal + y-translate, grid-এ column অনুযায়ী 120ms stagger — `RevealBlock` |
| Brand marquee | নিরবচ্ছিন্ন GSAP loop, DB-র আসল brand নাম দিয়ে — `MarqueeStrip` |
| Stats | scroll-এ এলে 0 থেকে গুনে ওঠে — `CountUp` |
| Parallax | `Parallax` component (scrub-linked drift) |
| Nav | hero পেরোলে transparent → solid; link underline বাঁ থেকে wipe in |
| Button | hover-এ sheen sweep, active-এ 0.98 scale |
| Card hover | -6px lift + image slow zoom |
| Mobile menu | Framer Motion overlay + link stagger |

**নিয়ম:** bouncy/elastic easing নেই। শুধু `transform` / `opacity` / `clip-path` animate হয়। `prefers-reduced-motion` সব জায়গায় respect করা — তখন start state গুলো CSS media query বা JS দিয়ে clear হয়ে যায়, কিছুই লুকানো থাকে না।

**GSAP-এর একটা ফাঁদ যেটায় পড়েছিলাম:** CSS-এ `translateY(110%)` থাকলে GSAP সেটা parse করে নিজের px-ভিত্তিক `y` slot-এ রাখে, তারপর `yPercent` তার **উপরে** যোগ করে। তাই শুধু `yPercent: 110 → 0` animate করলে সেই parse করা offset রয়ে যায় আর লেখা কখনো দেখাই যায় না। সমাধান — `fromTo`-এর দুই দিকেই `y: 0` explicitly দেওয়া (দেখুন `RevealText.tsx`)।

---

## Build Status: **সম্পূর্ণ (Phase 0–7, 9 — কোড সম্পন্ন)**

সব phase-এর কোড লেখা শেষ, build + lint + typecheck পাস করেছে। যা যা হয়েছে:

- ✅ Phase 0 — Scaffold (Next.js 16, TypeScript strict, সব dependency)
- ✅ Phase 1 — Design system + shell (TopBar, Navbar, MobileMenu, Footer, RevealText/RevealBlock, SmoothScrollProvider)
- ✅ Phase 2 — Supabase integration কোড (client/server/admin client, services, `src/proxy.ts`) — **SQL migration ও storage bucket ব্যবহারকারীকে manually চালাতে হবে, নিচে দেখুন**
- ✅ Phase 3 — Home (HeroVideo, InventorySearch, FeaturedCars, BrandStatement, CategoryStrip, StoreMap with Leaflet, ContactCta)
- ✅ Phase 4 — Inventory (filter/sort/pagination, car detail, category pages)
- ✅ Phase 5 — Compare (localStorage provider, CompareBar, CompareTable with diff-highlighting)
- ✅ Phase 6 — Static pages (About, Governing Body, Contact — placeholder কনটেন্ট `src/data/`-এ)
- ✅ Phase 7 — Admin panel (magic-link login, car CRUD, multi-image upload/cover/delete)
- ⏸️ Phase 8 — 360° View: placeholder page আছে, format এখনো দেওয়া হয়নি
- ✅ Phase 9 — Polish (metadata/OG, sitemap/robots, loading/error/not-found, reduced-motion, egress-conscious images)

---

## Verification — যা যাচাই করা হয়েছে

- `npx tsc --noEmit` — ✅ কোনো error নেই
- `npm run lint` — ✅ কোনো error/warning নেই
- `npm run build` — ✅ পরিষ্কার production build, সব ১৭টা route ঠিকভাবে generate হয়েছে
- Dev server-এ সব route curl দিয়ে চেক করা হয়েছে (`/`, `/inventory`, `/categories/[x]`, `/compare`, `/about-us`, `/governing-body`, `/contact-us`, `/360-view`, `/admin`, `/admin/login`) — সব ঠিক status code দিচ্ছে
- **আসল bug ধরা পড়েছে ও ঠিক হয়েছে:** middleware প্রথমে কাজ করছিল না কারণ `src/` directory convention-এ middleware ফাইল `src/middleware.ts`-এ থাকা উচিত, root-এ নয় — এখন ঠিক আছে। এরপর Next.js 16-এর deprecation notice অনুযায়ী `middleware.ts` → `src/proxy.ts` এ migrate করা হয়েছে (function নাম `middleware` → `proxy`)। যাচাই করা হয়েছে: `/admin` unauthenticated অবস্থায় ৩০৭ redirect করে `/admin/login`-এ।

**এখনো যাচাই করা যায়নি** (Supabase-এ ডেটা ছাড়া সম্ভব না):
- Admin login → magic link → car CRUD → image upload-এর পূর্ণ end-to-end flow
- RLS আসলেই write আটকাচ্ছে কিনা (policy কোড লেখা হয়েছে, কিন্তু DB-তে প্রয়োগ করা হয়নি)

---

## এখন আপনাকে যা করতে হবে (Manual Steps)

### ১. Supabase project সেটআপ — ✅ **হয়ে গেছে, যাচাই করা**
তিনটা SQL ফাইলই ঠিকঠাক চলেছে। যাচাই করে দেখা গেছে: `admin_members`-এ আপনার email আছে, `cars`-এ ৮টা গাড়ি, `car_images` ও `inquiries` টেবিল তৈরি, `car-images` bucket আছে।

**একটা জিনিস ঠিক করতে হয়েছে:** bucket-টা **private** হিসেবে তৈরি হয়েছিল (`public: false`), তাই ছবি ৪০০ দিচ্ছিল। সেটা public করে দেওয়া হয়েছে। ভবিষ্যতে নতুন bucket বানালে "Public bucket" টিক দিতে ভুলবেন না।

**Demo ছবিও বসানো হয়েছে:** ৮টা গাড়ির প্রতিটার জন্য ৩টা করে (মোট ২৪টা) placeholder ছবি generate করে Supabase Storage-এ upload করা হয়েছে — প্রতি গাড়ির নিজস্ব রঙ, গাড়ির silhouette সহ। আসল ছবি পেলে admin panel থেকে replace করে দিবেন।

### ২. Resend (custom SMTP) — আপনি নিজে করবেন বলেছেন
Supabase Dashboard → **Authentication → Providers → SMTP Settings**-এ Resend-এর credentials বসাবেন। এটা ছাড়া built-in email rate limit-এ আটকাতে পারেন dev-এ বেশি টেস্ট করলে।

### ৩. Redirect URL allowlist
Supabase Dashboard → **Authentication → URL Configuration** → Redirect URLs-এ `http://localhost:3000/**` যোগ করুন (deploy করলে production URL-ও যোগ করতে হবে)।

### ৪. Content (না দিলে placeholder-ই থাকবে)
- `public/videos/hero.webm` — **এখন একটা dummy ভিডিও বসানো আছে** (৩ সেকেন্ডের loop, ধীরে সরতে থাকা আলো + grain, ~৮৭০KB) সাথে `public/images/hero-poster.jpg`। আসল showroom ফুটেজ পেলে একই নামে replace করবেন, নয়তো `HeroVideo.tsx`-এর `<source>` path বদলাবেন।
- `src/data/site.ts` — real ঠিকানা, lat/lng, phone, social links (এখন Dubai-এর একটা placeholder lat/lng বসানো আছে)
- `src/data/about.ts`, `src/data/contact.ts`, `src/data/governingBody.ts` — real কনটেন্ট
- 360° view-এর format — যখন ঠিক করবেন, viewer বানানো হবে

### ৫. চালানো
```
npm run dev
```
তারপর `http://localhost:3000` এ browser-এ দেখুন। Supabase migration না চালালে গাড়ির তালিকা খালি দেখাবে (এটা bug না — graceful empty state)।
