# Golf Charity Subscription Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Database-00e599)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)

A premium, subscription-driven web application combining golf performance tracking, charitable giving, and a monthly draw-based reward engine. Designed explicitly to feel emotionally engaging and modern—eschewing traditional "fairway green" golf clichés in favor of deep dark modes, glassmorphism, and fluid animations.

Developed as a rigorous assignment submission for the **Digital Heroes Full-Stack Development Trainee Selection Process**.

---

## 🚀 Live Demo & Assets

- **Live Application**: [*(Deploy URL here)*](#)

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| **Registered User** | `test@golfcharity.com` | `Test@123456` |
| **Administrator** | `admin@golfcharity.com` | `Admin@123456` |

---

## 🎯 PRD Fulfillment Overview

This application serves as the single source of truth for all requirements defined in the March 2026 PRD. It tackles all required pillars:

1. **Subscription Engine:** Monthly and Yearly tiered plans powered by Razorpay (handling simulated netbanking paths) complete with backend lifecycle validation in edge middleware.
2. **Score Management Constraints:** Users can only retain a strict chronological rolling log of their `latest 5 scores`, bounded structurally to the Stableford format (1 - 45).
3. **Charity Integration:** The platform securely calculates and allocates a mandatory `10% minimum kickback` to a user-selected charity during their robust onboarding flow.
4. **Draw & Prize Engine:** Monthly draws dynamically parse database subscriptions to execute payout math across `5-Match (40% + Rollover)`, `4-Match (35%)`, and `3-Match (25%)` winners. Built with both purely random and algorithm-driven methodologies.
5. **Winner Verification:** Integrated Cloudinary flow allows winners to upload proof of handicap/score legitimacy, passing into an Admin pipeline for payout resolution.
6. **Aesthetic Requirements:** Tailored dark-mode UI populated with micro-interactions via `framer-motion` to stimulate emotional investment and premium conversion pathways.

---

## 🛠️ Technical Architecture & Stack

Designed for scalability (multi-country rollouts and future campaign/corporate modules) using an enterprise-grade stack:

- **Framework**: [Next.js 14 App Router](https://nextjs.org/) (React 18)
- **Database**: [Neon Postgres](https://neon.tech/) (Relational, Serverless)
- **ORM**: [Prisma](https://prisma.io/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Hybrid Edge / Node deployment)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Payment Gateway**: [Razorpay](https://razorpay.com/) *(Integrated as Stripe alternative per specific technical instructions)*
- **Emails**: [Resend](https://resend.com/)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `v18.17+`
- A Neon PostgreSQL Database
- Razorpay Test Credentials (or keep `NEXT_PUBLIC_PAYMENT_MODE="mock"`)
- Cloudinary Account

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/digital-heroes-golf-platform.git
cd digital-heroes-golf-platform
npm install
```

### 2. Environment Variables
Create a `.env` file referencing the structure of `.env.example`:
```env
# Database
DATABASE_URL="postgresql://user:pass@ep-xyz.region.aws.neon.tech/neondb"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"

# Payments
NEXT_PUBLIC_PAYMENT_MODE="mock" # Set to "razorpay" for real UI flows
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# Image Uploads
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 3. Database Sync & Seed
```bash
# Push schema to Neon
npx prisma db push

# Seed the database with the admin, test user, and charity models
npx prisma db seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📂 Project Structure

```text
├── app/
│   ├── (public)/          # Marketing, Charities Directory, Pricing
│   ├── (protected)/       # Subscriber Dashboards, Score Entry, Onboarding
│   ├── (admin)/           # Full Admin CRM (Draws, Payouts, Users)
│   ├── api/               # Next.js Route Handlers (Edge & Node)
│   └── globals.css        # Tailwind v3 config & Glassmorphism themes
├── components/            # Reusable UI Blocks (shadcn/ui + custom)
├── lib/                   # NextAuth Config, Prisma Singleton, Utilities
├── prisma/
│   ├── schema.prisma      # Relational DB Schema
│   └── seed.ts            # Bootstrapping logic
└── middleware.ts          # Edge-based Auth Route Protection
```

---

* **Problem Solving (State Syncing)**: Built an advanced client-side trigger resolving a caching conflict between Razorpay's immediate asynchronous database updates and NextAuth's encrypted Edge-cached JWT session cookies to seamlessly route a user into Onboarding.
* **Security & Auth**: Separated Edge Auth logic (`auth.config.ts`) from Node Auth logic (`auth.ts`) so middleware can execute with 0ms latency without relying on Prisma edge polyfills.
* **Component Modularity**: Constructed the vast majority of form-heavy operations using isolated React Server Actions or optimized client-side React hooks for minimal rendering bottlenecks.

---

