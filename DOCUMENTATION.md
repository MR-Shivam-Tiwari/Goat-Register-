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
12. [Access Control & Roles](#12-access-control--roles)
13. [Image Handling](#13-image-handling)
14. [Key Design Decisions](#14-key-design-decisions)
15. [Common Maintenance Tasks](#15-common-maintenance-tasks)
16. [Known Limitations & TODOs](#16-known-limitations--todos)

---

## 1. Project Overview

**Breed Register** (Племенной Реестр Коз) is the official breeding registry for the Association of Breeding Goats (Ассоциация Племенных Коз). It is a web application built in Next.js that allows breeders and association members to:

- Browse and search a registry of all registered goats
- View farm profiles and their registered stock
- Browse a breed catalog (by breed → sex → individual animals)
- Register and log in as a breeder/member
- Admins can add goats, add/edit farms, and manage users

The system was migrated from a legacy PHP/MySQL application. The database schema was preserved as-is from the original PHP system, which is why some column names and password hashing are unusual.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (via `pg` Node.js driver) |
| Hosting (Frontend) | Vercel |
| Database Host | Supabase (PostgreSQL) |
| Fonts | Google Fonts: Inter, Outfit |
| Icons | Lucide React |
| Toast Notifications | react-hot-toast |
| Rich Text (planned) | react-quill-new (installed, not yet wired up) |
| React | v19.2 (React Compiler enabled) |

> **Why no ORM?** The schema was migrated from a legacy PHP MySQL database. Raw SQL with the `pg` driver was used to avoid the friction of mapping an ORM to a legacy schema. All queries live in page files or `lib/db.ts`.

---

## 3. Running the App Locally

```bash
# Install dependencies
npm install

# Create environment file (see section 4)
cp .env.local.example .env.local  # or create manually

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
- In production (Vercel), use the **Transaction Pooler** URL from Supabase (port 6543), not the direct connection, to avoid IPv6 connectivity issues that caused prior deployment failures.
- The connection string must include `?pgbouncer=true&connection_limit=1` when using the pooler.
- SSL is automatically enabled in production (`rejectUnauthorized: false` is set in `lib/db.ts` to allow Supabase's self-signed certs).

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
│   │       │   ├── page.tsx    # Breed overview (shows M/F/Kid categories)
│   │       │   └── [sex]/
│   │       │       └── page.tsx # Goats of a breed filtered by sex
│   ├── farms/
│   │   ├── page.tsx            # Farm list
│   │   ├── add/page.tsx        # Add new farm (admin)
│   │   └── [id]/
│   │       ├── page.tsx        # Farm detail view
│   │       └── edit/page.tsx   # Edit farm (admin)
│   ├── goats/
│   │   ├── page.tsx            # Full goat registry list with filters
│   │   └── [id]/page.tsx       # Individual goat detail page
│   ├── login/page.tsx          # Login form
│   ├── register/page.tsx       # Registration form
│   ├── logout/                 # Logout handler route
│   ├── profile/page.tsx        # User profile
│   ├── users/page.tsx          # User list (admin only)
│   ├── rules/page.tsx          # Association rules page
│   ├── search/page.tsx         # Global search
│   ├── feedback/page.tsx       # Feedback/contact
│   └── unauthorized/page.tsx   # 403 page
├── components/                 # Reusable UI components
│   ├── Header.tsx              # Top bar (logo + org title + phone)
│   ├── Navbar.tsx              # Navigation bar (links + auth + language)
│   ├── LanguageSwitcher.tsx    # RU/EN dropdown
│   ├── Breadcrumbs.tsx         # Page breadcrumb trail
│   ├── SearchBar.tsx           # Global search input
│   ├── GoatFilters.tsx         # Client-side filter bar for goat list
│   ├── AddGoatForm.tsx         # Add goat form (client component)
│   ├── FarmEditor.tsx          # Add/edit farm form (client component)
│   └── ToastHandler.tsx        # Reads ?success=1 etc. from URL and shows toasts
├── lib/                        # Shared server-side utilities
│   ├── db.ts                   # PostgreSQL connection pool + query helper
│   ├── auth.ts                 # Password hashing (PHP-compatible + MD5)
│   ├── access-control.ts       # Session reading + adminOnly() guard
│   ├── actions.ts              # Server Actions: login, register, setLanguage
│   └── translations.ts         # All UI strings in RU and EN
├── public/
│   └── img/                    # All images (farm photos, breed photos, home images)
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 6. Database Overview

The app connects to a PostgreSQL database migrated from the original PHP site. Here are the key tables:

### `users`

| Column | Type | Notes |
|---|---|---|
| id | int | Primary key |
| login | varchar | Username |
| email | varchar | Email |
| name | varchar | Full name |
| phone | varchar | Phone number |
| pass | varchar | MD5 hash of password |
| token | varchar(19) | Session token (UNIQUE) — set on login |
| secret | varchar(18) | Random value (UNIQUE) |
| role | varchar | `'admin'` or `'member'` |
| is_apk | int | APK membership flag (0 or 1) |

### `animals`

| Column | Type | Notes |
|---|---|---|
| id | int | Primary key |
| name | varchar | Goat's nickname/name |
| sex | int | `1` = Male, `2` = Female (not 0/1!) |
| id_farm | int | FK → farms.id |
| id_user | int | FK → users.id (who added the record) |
| id_mother | int | FK → animals.id (maternal lineage) |
| id_father | int | FK → animals.id (paternal lineage) |
| status | int | `1` = alive, `0` = dead, `NULL` = unknown |
| time_added | timestamp | When record was created |

### `goats_data`

| Column | Type | Notes |
|---|---|---|
| id_goat | int | FK → animals.id |
| id_breed | int | FK → breeds.id |
| id_stoodbook | int | Studbook type (1 = Main, 10/11/12 = RCB variants) |
| code_ua | varchar | Ukrainian national ID code |
| is_abg | int | `1` if ABG (Association) member |
| manuf | varchar | Breeder/manufacturer name |
| owner | varchar | Current owner name |
| date_born | date | Date of birth |
| ... | | Other identification fields (chip, cert series, etc.) |

### `farms`

| Column | Type | Notes |
|---|---|---|
| id | int | Primary key |
| name | varchar | Farm name |
| tmpl | text | Farm description (stored as HTML from old PHP editor) |
| pic1 | varchar | Avatar image filename |
| pic2 | varchar | Secondary image filename |

### `breeds`

| Column | Type | Notes |
|---|---|---|
| id | int | Primary key |
| name | varchar | Breed name (e.g. "Зааненская") |
| alias | varchar | URL-safe alias (e.g. "zaanen") — used in catalog routes |

### `pictures`

| Column | Type | Notes |
|---|---|---|
| alias | varchar | Breed alias (matches breeds.alias) |
| sex | int | 0 = female, 1 = male, 2 = kid |
| file | varchar | Image filename in /public/img/ |

---

## 7. Authentication & Session System

### How Login Works

1. User submits login form → `loginAction()` Server Action in `lib/actions.ts`
2. Password is hashed with **MD5** (`crypto.createHash('md5')`)
3. DB query: `SELECT * FROM users WHERE (login = $1 OR email = $1) AND pass = $2`
4. On success: two cookies are set:
   - `uid_token` — the user's unique session token (httpOnly, secure in production)
   - `user_login` — the user's login name

### How Session Reading Works

`lib/access-control.ts` → `getSessionUser()`:
- Reads `uid_token` cookie
- Runs: `SELECT id, login, role FROM users WHERE token = $1`
- Returns `null` if not found (user is not logged in)

This function is called in every protected page and the Navbar.

### How Logout Works

Logout is a Server Action defined inside `Navbar.tsx`:
- Deletes `uid_token` and `user_login` cookies
- Redirects to `/login`

### Password Hashing Note

**Two hashing schemes exist in the codebase:**

| File | Scheme | Used For |
|---|---|---|
| `lib/actions.ts` (login/register) | Plain MD5 | Active login system |
| `lib/auth.ts` | `md5(crc32(base64(reverse(pass) + salt)))` | Legacy PHP compat — NOT used in login flow |

> **Important:** `lib/auth.ts` (`phpHash`) is NOT called anywhere in the current login flow. It exists as a reference for the original PHP password format, in case you need to migrate old users. New registrations use simple MD5 (matching what the PHP site stored).

### Admin Detection

Pages check for admin status using one of two methods:
- `getSessionUser()` returns `user.role === 'admin'` — used in Navbar and protected pages
- `adminOnly()` — redirects to `/unauthorized` if not admin; used on pages that should be completely blocked

---

## 8. Internationalization (i18n)

All UI strings are managed in `lib/translations.ts`.

### How It Works

1. Language is stored in the `nxt-lang` cookie (`'ru'` or `'en'`)
2. Default is `'ru'` (Russian)
3. Every server component reads the cookie: `cookieStore.get('nxt-lang')?.value`
4. Calls `getTranslation(lang)` to get the full translation object `t`
5. Uses `t.section.key` everywhere in JSX

### Adding a New String

Open `lib/translations.ts`. Find the relevant section (e.g. `farms`, `goats`, `nav`, `home`, `rules`, `users`, `common`). Add your key in both `ru` and `en` objects:

```typescript
// In translations.ts
farms: {
  myNewKey: {
    ru: 'Мой текст',
    en: 'My text'
  }
}
```

Then use `t.farms.myNewKey` in your component.

### Changing Language

`LanguageSwitcher.tsx` is a client component. When a language is selected:
1. Calls `setLanguage(lang)` Server Action from `lib/actions.ts`
2. Sets `nxt-lang` cookie
3. Calls `router.refresh()` to re-render all server components with new language

---

## 9. Pages & Routes

### `/` — Home Page
**File:** `app/page.tsx`
- Purely informational/marketing page
- Shows organization description + philosophical quote
- Images on left/right columns (desktop), grid on mobile
- Content is entirely from the translations file (keys: `t.home.*`)
- `export const dynamic = 'force-dynamic'` — always server-renders fresh (reads cookie for lang)

---

### `/goats` — Full Goat Registry
**File:** `app/goats/page.tsx`
- Shows all goats in a scrollable data table (up to 1000 records)
- Supports URL query params for filtering: `?q=`, `?breed=`, `?sex=`, `?view=`
- Filter values: `view=r` (main studbook), `view=x` (RCB), `view=living`, `view=dead`, `view=nostatus`, `view=duplicates`
- Uses `GoatFilters` client component for interactive filtering
- Each row links to `/goats/[id]`

---

### `/goats/[id]` — Individual Goat Detail
**File:** `app/goats/[id]/page.tsx`
- Shows full data for a single goat from `animals` + `goats_data` JOIN
- Displays pedigree (mother/father links), identification codes, breed, farm, etc.

---

### `/farms` — Farm List
**File:** `app/farms/page.tsx`
- Lists all farms from the `farms` table
- Resolves farm avatar images server-side (checks `/public/img/farm/` then `/public/img/`)
- Falls back to `/img/farm_placeholder.png` if no image found
- Edit button only visible when `uid_token` cookie is present (any logged-in user can see it — see Known Limitations)

---

### `/farms/[id]` — Farm Detail
**File:** `app/farms/[id]/page.tsx`
- Shows farm info header (photo + name + HTML description + stats)
- **Active Stock** table: goats where `A.id_farm = id`
- **Displaced Stock** table: goats where `Di.manuf ILIKE '%farmPrefix%'` but `id_farm != id` (i.e., born at this farm but moved elsewhere). Uses the first word of the farm name as a prefix match.
- "Displaced" section only renders if there are results
- Farm description (`tmpl`) is rendered as raw HTML via `dangerouslySetInnerHTML` — this is safe because it's admin-entered content from the trusted old PHP system

---

### `/farms/add` — Add Farm
**File:** `app/farms/add/page.tsx`
Uses the `FarmEditor` component with `isEdit={false}`.

### `/farms/[id]/edit` — Edit Farm
**File:** `app/farms/[id]/edit/page.tsx`
Uses the `FarmEditor` component with `isEdit={true}` and pre-filled `initialData`.

> **Note:** The FarmEditor form currently does a client-side redirect on submit (`router.push('/farms?success=1')`) without actually saving to the database. The DB write logic needs to be wired up as a Server Action.

---

### `/catalog/goats` — Breed Catalog Index
**File:** `app/catalog/goats/page.tsx`
- Lists all breeds from the `breeds` table as clickable cards
- Each card links to `/catalog/goats/[alias]`

---

### `/catalog/goats/[alias]` — Breed Detail
**File:** `app/catalog/goats/[alias]/page.tsx`
- Looks up breed by `alias` field (case-insensitive, trimmed)
- Fetches breed pictures from `pictures` table (by alias + sex)
- Shows 3 category cards: Does (sex=0), Bucks (sex=1), Kids (sex=2)
- Each card links to `/catalog/goats/[alias]/[sex]`

---

### `/catalog/goats/[alias]/[sex]` — Breed + Sex Animal List
**File:** `app/catalog/goats/[alias]/[sex]/page.tsx`
- Lists all goats of a given breed and sex category
- `sex` route param maps: `female` → 0, `male` → 1, `child` → 2

---

### `/catalog/goats/add` — Add Goat (Auth Required)
**File:** `app/catalog/goats/add/page.tsx`
Uses the `AddGoatForm` client component. Currently does a client-side redirect on submit without DB save (same as FarmEditor — needs Server Action wiring).

---

### `/login` — Login
**File:** `app/login/page.tsx`
- Uses React `useFormState` + `loginAction` Server Action
- Shows error message on failure
- On success, redirects to `/`

---

### `/register` — Registration
**File:** `app/register/page.tsx`
- Uses `registerAction` Server Action
- Validates password match
- Checks for duplicate login/email
- MD5 hashes password
- Inserts with role `'member'` and `is_apk = 0`

---

### `/rules` — Association Rules
**File:** `app/rules/page.tsx`
- Static page showing association protocol text
- Content from translation keys: `t.rules.title`, `t.rules.desc`

---

### `/profile` — User Profile
**File:** `app/profile/page.tsx`
- Shows logged-in user's details

---

### `/users` — User Management (Admin Only)
**File:** `app/users/page.tsx`
- Lists all users
- Protected by `adminOnly()` from `lib/access-control.ts`

---

### `/unauthorized` — 403 Page
**File:** `app/unauthorized/page.tsx`
- Shown when a non-admin tries to access an admin-only page

---

## 10. Components Reference

### `Header.tsx` (Server Component)
- Fixed top bar with logo, association title, and contact phone
- Logo image: `/public/img/forum_kozovodstvo.jpg`
- Phone number is hardcoded as `+7 (000) 000-00-00` — update directly in the file
- Background color: `bg-primary` (CSS variable, dark brown `#491907`)

---

### `Navbar.tsx` (Server Component)
- Sticky navigation bar below the Header
- Dynamically adds links based on auth state:
  - All users: Home, Registry, Farms, Catalog, Rules, Forum (external)
  - Logged-in users: also shows "Add Goat"
  - Admins: also shows "Users"
- Right side: LanguageSwitcher + user info or Login/Register buttons
- Logout is a Server Action defined inline in this file
- Forum link: `https://kozovodstvo.center/` (external site)

---

### `LanguageSwitcher.tsx` (Client Component)
- Dropdown toggle showing current lang (flag + code)
- Calls `setLanguage()` Server Action, then `router.refresh()`
- Closes on outside click (uses `useRef` + `mousedown` event listener)
- Supported languages: `ru` (Russian), `en` (English)

---

### `Breadcrumbs.tsx` (Server Component)
- Renders a breadcrumb trail from an array of `{ label, href? }` items
- Last item has no link (current page)

---

### `GoatFilters.tsx` (Client Component)
- Interactive filter bar for the `/goats` registry page
- State: `search`, `breed`, `sex`, `view`
- On any state change, `useEffect` builds a query string and calls `router.push()`
- This causes the page to re-render server-side with new data
- Quick filter buttons change the `view` state
- "Reset Filters" clears all state

---

### `AddGoatForm.tsx` (Client Component)
- Large form for adding a new goat to the registry
- Sections: General Info, Status & Type, Assessment & Dates, Ownership & ID, Genetic Notes, Photo Upload
- `handleSubmit` currently just redirects to `/catalog/goats/list?success=1` — **DB write not implemented**
- Photo upload uses React state to preview the selected file name

---

### `FarmEditor.tsx` (Client Component)
- Reusable form for adding or editing a farm
- Props: `lang`, `initialData` (name + description), `isEdit`, `showContainer`
- `showContainer={false}` renders just the form (used in edit page which has its own layout)
- `showContainer={true}` wraps in a full page layout (used for the add page)
- Has a mock rich-text toolbar (visual only — textarea underneath)
- **DB write not implemented** — submit redirects to `/farms?success=1`

---

### `ToastHandler.tsx` (Client Component)
- Reads URL search params (`?success=`, `?error=`, `?toast=`)
- Shows `react-hot-toast` notifications accordingly
- Wrapped in `<Suspense>` in layout to avoid hydration issues
- Used for post-redirect feedback (e.g. after form submissions)

---

### `SearchBar.tsx` (Client Component)
- Standalone search input (used in search page)
- Pushes `?q=value` to router on submit

---

## 11. Library Modules (lib/)

### `lib/db.ts`
- Creates a single `pg.Pool` using `DATABASE_URL`
- Exports `query(text, params)` — a thin wrapper around `pool.query`
- SSL enabled in production only
- All DB calls throughout the app use this function

### `lib/auth.ts`
- Exports `phpHash(password)` — a PHP-compatible password hashing function
- Formula: `md5(crc32(base64(reverse(pass) + 'abgregistry')))`
- **Not used in the active login flow** — kept for reference/migration

### `lib/access-control.ts`
- `getSessionUser()` — reads `uid_token` cookie, queries users table, returns user or null
- `adminOnly()` — calls `getSessionUser()`, redirects to `/unauthorized` if not admin

### `lib/actions.ts`
- All functions marked `'use server'`
- `loginAction(prevState, formData)` — handles login, sets cookies
- `registerAction(prevState, formData)` — handles registration
- `setLanguage(lang)` — sets `nxt-lang` cookie

### `lib/translations.ts`
- Large object with all UI strings in `ru` and `en`
- `getTranslation(lang: Locale)` returns a nested object of strings
- `Locale` type = `'ru' | 'en'`

---

## 12. Access Control & Roles

| Role | Capabilities |
|---|---|
| Guest (not logged in) | Browse goats, farms, catalog, rules, home |
| Member (logged in) | All of above + add goat form + profile |
| Admin | All of above + users list + edit farms |

**How roles are enforced:**

- `adminOnly()` in `lib/access-control.ts` is called at the top of admin-only page files. It redirects to `/unauthorized` if check fails.
- In pages like farms and goats, admin-only UI elements (edit buttons) are conditionally rendered by checking `cookieStore.get('uid_token')?.value` — this checks if **any** user is logged in, not just admin. This is a **known limitation** (see section 16).

---

## 13. Image Handling

### Farm Images
Farm images are stored in the database as just a filename (e.g. `myfarm.jpg`). When rendering, the code checks two paths:
1. `/public/img/farm/[filename]`
2. `/public/img/[filename]`

If neither exists, falls back to `/img/farm_placeholder.png`.

This resolution logic is duplicated in both `app/farms/page.tsx` and `app/farms/[id]/page.tsx`. If you change the image storage structure, update both.

### Breed/Catalog Images
Stored in the `pictures` table with `alias` (breed alias) and `sex` (0/1/2) and `file` (filename). Served from `/public/img/[file]`.

### Home Page Images
Static image files in `/public/img/` with names like `home_milk_nature.png`, etc. These are hardcoded in `app/page.tsx`.

### Logo
`/public/img/forum_kozovodstvo.jpg` — used in the Header.

---

## 14. Key Design Decisions

### Why Next.js App Router?
The App Router allows mixing server and client components. Server components fetch data directly (no API layer needed), which simplifies the architecture significantly for a data-heavy registry app.

### Why `export const dynamic = 'force-dynamic'`?
Pages that read cookies (for auth or language) must not be statically cached. This directive tells Next.js to always server-render these pages on request. Without it, the language/auth state would be baked into a cached page.

### Why raw SQL instead of an ORM?
The database schema was migrated from a PHP/MySQL legacy system with unconventional column names and relations. Using raw SQL avoids the complexity of fitting this schema into an ORM's conventions.

### Why is the password hashing MD5 only?
MD5 is intentionally kept for compatibility with the legacy PHP application's stored passwords. Users who existed before the migration already have MD5-hashed passwords in the database. The `phpHash` function in `lib/auth.ts` documents the original more complex hash scheme, but the active system uses simple MD5.

> **Security Note:** MD5 is not a secure password hash. For a future upgrade, consider migrating to bcrypt by adding a new `pass_v2` column, hashing new passwords with bcrypt, and checking both during login.

### Why `dangerouslySetInnerHTML` for farm descriptions?
Farm descriptions (`tmpl` column) are HTML entered by admins via a rich text editor in the old PHP system. Rendering them as HTML directly preserves the rich formatting. This is acceptable because only admins can set this content (not user-generated).

### Why is the `displaced` stock section important?
The breeding registry tracks not just where an animal lives but where it was born. The "displaced" query finds animals bred at a farm but now listed under a different farm. This is a unique business requirement of the breeding registry.

### Why is language a cookie and not a URL param?
Cookie-based language allows server components to access the language preference without it being in the URL. The original PHP site also used a session/cookie-based language toggle, and this approach was kept consistent.

### Styling: Tailwind CSS v4 + CSS Variables
The primary brand color (`#491907`, a dark reddish-brown) is used throughout as `bg-primary` / `text-primary`. The secondary color (cream/off-white) is `text-secondary`. These are defined in `globals.css` as CSS variables.

---

## 15. Common Maintenance Tasks

### Add a New Translation String
1. Open `lib/translations.ts`
2. Find the right section (or add a new section)
3. Add the key with both `ru` and `en` values
4. Use `t.section.key` in the target component

### Add a New Navigation Link
1. Open `components/Navbar.tsx`
2. Find the `navLinks` array
3. Add `{ href: '/your-route', label: t.nav.yourKey }`
4. Add `yourKey` to `lib/translations.ts` under the `nav` section

### Add a New Page
1. Create a folder under `app/` with a `page.tsx`
2. If the page reads cookies (auth/lang), add `export const dynamic = 'force-dynamic'`
3. Import and call `getSessionUser()` or `adminOnly()` as needed
4. Import `getTranslation` and `cookies` for i18n

### Change the Contact Phone Number
Open `components/Header.tsx`, find the `<span>` with the phone number and update it.

### Add a New User Role
1. The `users.role` column is a plain varchar
2. Add your new role string to the DB
3. Update `access-control.ts` to handle the new role
4. Update `Navbar.tsx` to conditionally show/hide links for the new role

### Debug a Database Issue
- Check `lib/db.ts` for the pool configuration
- Errors are logged to `console.error` in the `query()` function
- Check Supabase dashboard for connection status
- Ensure the `DATABASE_URL` uses the Transaction Pooler URL (port 6543) not the direct URL (port 5432) — the direct URL has IPv6 compatibility issues on Vercel

### Deploy to Vercel
1. Push to the connected Git branch
2. Vercel auto-deploys
3. Ensure environment variable `DATABASE_URL` is set in Vercel's project settings (Settings → Environment Variables)
4. Use the Supabase Transaction Pooler URL (not Direct Connection URL)

---

## 16. Known Limitations & TODOs

| Issue | Details |
|---|---|
| **Farm/Goat forms don't save to DB** | `AddGoatForm.tsx` and `FarmEditor.tsx` submit handlers redirect without hitting the DB. Server Actions for actual INSERT/UPDATE need to be implemented. |
| **Edit button visible to all logged-in users** | The farms list page checks `uid_token` exists (any logged-in user), not `user.role === 'admin'`. Should use `getSessionUser()` and check role. |
| **No file upload implementation** | Photo upload fields exist in the forms but don't upload files. Would need Supabase Storage or similar. |
| **Hardcoded phone number** | `+7 (000) 000-00-00` in Header.tsx — replace with real number. |
| **Hardcoded "Ukraine / Regional"** | Farm location is hardcoded in the farm list table row. The `farms` DB table has no location column. Add one or remove the column. |
| **`lib/auth.ts` phpHash unused** | Kept as documentation. Can be deleted or used during a user password migration if needed. |
| **react-quill-new installed but not used** | Installed for future rich text editing in farm descriptions. FarmEditor has a mock visual toolbar but a plain textarea underneath. |
| **No pagination on goat list** | The goat registry query has a hard `LIMIT 1000`. Large registries will need pagination. |
| **MD5 passwords** | Not secure. Long-term: migrate to bcrypt. |
| **Certificate button on farm page** | The "Certificate ➔" button in the farm detail view is a non-functional `<button>` element. Its intended functionality (PDF generation?) is not implemented. |
