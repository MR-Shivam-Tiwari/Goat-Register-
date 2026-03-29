# Goat Registry — Developer Documentation
**Project: goat-registry-next**
**Last updated: March 2026**
**Prepared for: Maintenance Engineer Handoff**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Running the App Locally](#3-running-the-app-locally)
4. [Environment Variables](#4-environment-variables)
5. [Directory Structure](#5-directory-structure)
6. [Database Overview](#6-database-overview)
7. [Authentication & Session System](#7-authentication--session-system)
8. [Internationalization (i18n)](#8-internationalization-i18n)
9. [Pages & Routes](#9-pages--routes)
10. [Components Reference](#10-components-reference)
11. [Library Modules (lib/)](#11-library-modules-lib)
12. [Key Design Decisions](#12-key-design-decisions)
13. [Common Maintenance Tasks](#13-common-maintenance-tasks)
14. [Known Limitations & TODOs](#14-known-limitations--todos)

---

## 1. Project Overview

**Breed Register** (Племенной Реестр Коз) is the official breeding registry for the Association of Breeding Goats (Ассоциация Племенных Коз). It is a web application built in Next.js that allows breeders and association members to:

- Browse and search a registry of all registered goats
- View farm profiles and their registered stock
- Browse a breed catalog (by breed → sex → individual animals)
- Register and log in as a breeder/member
- Admins can add goats, add/edit farms, and manage users
- View detailed animal profiles including pedigree, offspring, and productivity data

The system was migrated from a legacy PHP/MySQL application. The database schema was preserved as-is from the original PHP system, which is why some column names and password hashing are unusual.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (via `pg` Node.js driver) |
| Hosting (Frontend) | Vercel |
| Database Host | Supabase (PostgreSQL) |
| Fonts | Google Fonts: Inter, Outfit |
| Icons | Lucide React |
| Toast Notifications | react-hot-toast |
| React | v19+ (React Compiler enabled) |

> **Why no ORM?** The schema was migrated from a legacy PHP MySQL database. Raw SQL with the `pg` driver was used to avoid the friction of mapping an ORM to a legacy schema. All queries live in page files or `lib/db.ts` / `lib/goats-data.ts`.

---

## 3. Running the App Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app starts on **http://localhost:3000**.

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## 4. Environment Variables

File: `.env.local` (never commit this file)

```
DATABASE_URL=postgresql://user:password@host:port/dbname?pgbouncer=true&connection_limit=1
```

### Notes on DATABASE_URL

- The app connects to a **Supabase** PostgreSQL instance.
- In production (Vercel), use the **Transaction Pooler** URL from Supabase (port 6543), not the direct connection, to avoid IPv6 connectivity issues.
- The connection string must include `?pgbouncer=true&connection_limit=1` when using the pooler.
- SSL is automatically enabled in production (`rejectUnauthorized: false` is set in `lib/db.ts`).

---

## 5. Directory Structure

```
goat-registry-next/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (Header + Navbar + Toaster)
│   ├── page.tsx                # Home page (/)
│   ├── globals.css             # Global CSS + Tailwind imports
│   ├── catalog/
│   │   └── goats/
│   │       ├── [alias]/        # Breed detail page
│   │       │   ├── page.tsx    # Breed overview
│   │       │   └── [sex]/
│   │       │       └── page.tsx # Goats by breed and sex
│   ├── farms/
│   │   ├── page.tsx            # Farm list
│   │   ├── [id]/
│   │   │   ├── page.tsx        # Farm detail view
│   │   │   └── edit/page.tsx   # Edit farm (admin)
│   ├── goats/
│   │   ├── page.tsx            # Full goat registry list
│   │   └── [id]/page.tsx       # Individual goat detail page
│   ├── profile/page.tsx        # User profile
│   ├── users/page.tsx          # User management (admin)
│   └── ...                     # Auth & other routes
├── components/                 # Reusable UI components
├── lib/                        # Shared server-side utilities
│   ├── db.ts                   # PostgreSQL connection pool
│   ├── goats-data.ts           # Shared data fetching logic for goats
│   └── translations.ts         # Centralized i18n strings
├── public/                     # Static assets (img/)
└── ...
```

---

## 6. Database Overview

The app uses a PostgreSQL database with a legacy schema. Key tables:

### Core Tables
- **`animals`**: Primary registry table (id, name, sex, id_farm, id_mother, id_father, status).
- **`goats_data`**: Extended animal data (breed, studbook, codes, owner, birth date).
- **`farms`**: Farm profiles (name, description, photos).
- **`users`**: User accounts and roles (login, pass, email, role).
- **`breeds`**: Breed definitions (name, alias).

### Supporting Tables
- **`goats_lact`**: Lactation records (milk yield, fat, protein, days).
- **`goats_milk`**: Productivity metrics (peak yield, lactose, density).
- **`goats_test`**: Expert assessments and body measurements.
- **`goats_cert`**: Stored certification data linkages.
- **`goats_pic`**: Animal gallery images.
- **`stoodbook`**: Studbook classifications (Main, RCB, etc.).

---

## 7. Authentication & Session System

- **Login**: Handled via `lib/actions.ts` (`loginAction`).
- **Hashing**: MD5 is used for legacy compatibility.
- **Session**: Cookie-based (`uid_token`).
- **Guard**: `lib/access-control.ts` provides `getSessionUser()` and `adminOnly()`.

---

## 8. Internationalization (i18n)

The app is fully localized in **Russian (RU)** and **English (EN)**.

- **Storage**: `lib/translations.ts` contains the `translations` object.
- **Persistence**: Saved in the `nxt-lang` cookie.
- **Usage**: Every server component reads the cookie and calls `getTranslation(lang)`.
- **Switcher**: `LanguageSwitcher.tsx` toggles between locales.

---

## 9. Pages & Routes

### `/goats/[id]` — Individual Goat Detail
**File:** `app/goats/[id]/page.tsx`
This is the most complex page, featuring:
- **Header**: Name, breed, sex, registry code, and quick links to parents.
- **Basic Info**: Tabular view of official registry data.
- **Gallery**: Photo carousel/grid from `goats_pic`.
- **Pedigree**: 4-generation interactive tree view.
- **Offspring**: Detailed summary and tabular view of direct descendants.
- **Own Productivity**: Detailed lactation metrics (milk, fat, protein, lactose, etc.).
- **Expert Assessment**: Official test results and body measurements.
- **Certificate Data**: Selectable lactation data for official documents.
- **3rd Gen Productivity**: Shortened metrics for ancestors.
- **Movement**: Log of animal ownership/farm changes.

### `/farms/[id]` — Farm Profile
Shows farm description and stock analysis (Active vs. Displaced).

---

## 10. Components Reference

- **`Header.tsx`**: Fixed top bar with logo and contact phone.
- **`Navbar.tsx`**: Navigation links + Auth state (Login/Register or Logout/User Info).
- **`LanguageSwitcher.tsx`**: Locale selection (RU/EN).
- **`Breadcrumbs.tsx`**: Navigation path.
- **`GoatFilters.tsx`**: Advanced filtering for the main registry.
- **`GoatTable.tsx`**: Reusable data grid for animal lists.
- **`PedigreeNode.tsx` / `PedigreeChart`**: Logic for rendering the ancestral tree.
- **`InviteSection.tsx`**: Tool for generating temporary access links.
- **`AddGoatForm.tsx` / `FarmEditor.tsx`**: Forms for adding/editing records.

---

## 11. Library Modules (lib/)

- **`lib/db.ts`**: PostgreSQL connection pool (via `pg`).
- **`lib/goats-data.ts`**: Centralized data fetching queries for animal profiles.
- **`lib/actions.ts`**: Server Actions for authentication and language switching.
- **`lib/access-control.ts`**: Session validation and RBAC guards.
- **`lib/translations.ts`**: All multilingual UI strings.
- **`lib/auth.ts`**: Legacy password hashing reference (MD5/CRC32).

---

## 12. Key Design Decisions

- **Raw SQL**: Used to navigate the legacy schema without ORM overhead.
- **Force Dynamic**: Pages reading cookies are forced to re-render server-side to ensure correct lang/auth state.
- **Tailwind v4**: Leverages the latest CSS-first features for a premium aesthetic.

---

## 13. Common Maintenance Tasks

- **Updating Text**: Edit `lib/translations.ts`.
- **Adding a Field**: Update `lib/goats-data.ts` query and the corresponding UI component.
- **Adding a Route**: Create folder in `app/` and ensure it follows the standard layout patterns.

---

## 14. Known Limitations & TODOs

- **DB Writes**: Animal/Farm forms need Server Action implementations for saving.
- **Storage**: File uploads (photos) currently use local paths; should migrate to cloud storage (e.g., Supabase Storage).
- **Security**: Port MD5 to bcrypt for modern security standards.
- **Pagination**: Large lists (goats/farms) need cursor or offset pagination.
- **Rich Text**: `react-quill-new` is installed but not yet integrated into the Farm Editor.
- **Hardcoded Phone**: Organization contact phone is currently hardcoded in `Header.tsx`.
