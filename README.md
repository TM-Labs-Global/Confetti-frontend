# Confetti — Event Planning & Vendor Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)

Confetti (also referred to as *Confette*) is an **AI-assisted event planning and vendor marketplace** platform built specifically for the Nigerian market. It is a full-stack web application combining a clean React 19 frontend with a robust Next.js backend, built using strict TypeScript, Tailwind CSS v4, and Prisma.

---

## 🌟 Key Features & Roles

The system supports three distinct user portals, each completely isolated by role-based routing and middleware security:

| Role | Portal Route | Primary Capabilities |
| :--- | :--- | :--- |
| **Organiser** | `/organiser` | Create event plans with wizard flows, manage custom/default budget allocations (Smart Budget Splits), view bids, accept/reject proposals, and track planning steps. |
| **Vendor** | `/vendor` | Browse the open marketplace feed, submit pitches/quotes, participate in counter-bid discussions, and track bid approval status. |
| **Admin** | `/admin` | Monitor system-wide event statistics, adjust default category budget splits, manage active disputes, and view the Escrow Ledger. |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, custom API Route Handlers)
- **UI Library**: [React 19](https://react.dev/) (Client and Server Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Database ORM**: [Prisma Client](https://www.prisma.io/) with SQLite (local) and support for production relational DBs
- **Security & Session**: Custom `HttpOnly` cookie JWT authentication using `jose` and `bcryptjs` password hashing
- **Iconography**: [Lucide React](https://lucide.dev/) (clean vector-based SVG components, fully tree-shakeable)

---

## 📂 Codebase Architecture

The project is structured with a **feature-first colocated architecture** inside `src/`. The Next.js `app/` folder contains only layout shells, page entrypoints, and API route handlers. All business logic lives in `features/` or `shared/`.

```
confetti-frontend/
├── prisma/                 # Database schema, migrations, and seed scripts
├── public/                 # Static assets (favicons, Open Graph media)
├── src/
│   ├── app/                # Next.js App Router — entry points & routing only
│   │   ├── api/            # API Route Handlers (Auth, Plans, Bids, Marketplace)
│   │   ├── organiser/      # Organiser pages and layouts
│   │   ├── vendor/         # Vendor pages and layouts
│   │   ├── admin/          # Admin pages and layouts
│   │   └── globals.css     # Global CSS import linking tokens and styles
│   │
│   ├── features/           # Self-contained business logic modules
│   │   ├── auth/           # Login, registration, and useAuth context
│   │   ├── organiser/      # Event creation, budgeting, and bid lists
│   │   ├── vendor/         # Marketplace, bid management, and counter-bids
│   │   ├── admin/          # Escrow ledger, admin statistics, overrides
│   │   ├── notifications/  # Event-driven in-app notifications
│   │   └── shared-ui/      # Domain-agnostic UI primitives (Buttons, Badges, Tabs)
│   │
│   └── shared/             # Cross-cutting concerns & shared infrastructure
│       ├── styles/         # CSS tokens (8pt grid, brand palettes, typography)
│       ├── utils/          # Formatting helpers (Naira currency formatting, dates)
│       ├── types/          # Global/API envelope TypeScript definitions
│       └── lib/            # Singletons (Prisma client, JWT utilities)
```

---

## 🎨 Design System & Styling

Confetti implements a custom premium design system defined via CSS variables.

### Key CSS Tokens (`src/shared/styles/tokens.css`)
- **Brand Palette**:
  - Primary Teal (`--color-primary`): `#00C4CC` (Primary actions, focus rings)
  - Success Green (`--color-success`): `#39E75F` (Escrow funded, bid accepted)
  - Warning Yellow (`--color-warning`): `#FFDE59` (Over-budget alerts, deadlines)
- **Backgrounds**:
  - Dark Mode (`--color-bg-dark`): `#0B0F19` & Surface (`--color-surface-dark`): `#161F30`
  - Light Mode (`--color-bg-light`): `#FAFAFC` & Surface (`--color-surface-light`): `#FFFFFF`
- **Typography**:
  - Display Font: `Sora` (sans-serif)
  - Body Font: `DM Sans` (sans-serif)
  - Monospace Font: `DM Mono` (monospace)
- **Grid & Spacing**: Strict 8-point vertical grid (`--space-xs` (4px) to `--space-2xl` (48px)).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x` recommended
- **npm**: `v9.x` or higher

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-32-character-minimum-development-secret-key"
```

### 4. Database Setup & Seeding
Initialize the SQLite database, apply migrations, generate the Prisma Client, and seed mock data:
```bash
# Sync schema and generate Prisma client
npx prisma db push

# Run database seed script
npx prisma db seed
```
*(Alternatively, you can manually seed the DB using `node prisma/seed.js`)*

### 5. Running the Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- To view the internal design system catalog, navigate to `/design-system` while running in development.
- To inspect database records directly, open the Prisma Studio visual browser:
  ```bash
  npx prisma studio
  ```

---

## 🧪 Quality Control & Building

To maintain code health, verify changes before committing:

- **Type-Check**: Run the TypeScript compiler without emitting files to catch type mismatch issues:
  ```bash
  npx tsc --noEmit
  ```
- **Lint**: Run ESLint to enforce project standards:
  ```bash
  npm run lint
  ```
- **Build**: Compile the project for production:
  ```bash
  npm run build
  ```

---

## 🔒 Authentication Flow Detail

```
Client (Browser)                 Next.js Server
  │                                    │
  │  POST /api/auth/login              │
  │ ─────────────────────────────────► │  1. Hash & verify credentials
  │                                    │  2. Sign JWTPayload
  │  Set-Cookie: confette_token=...    │  3. Attach HttpOnly secure cookie
  │ ◄───────────────────────────────── │
  │                                    │
  │  (Subsequent Requests)             │
  │  Cookie Header                     │
  │ ─────────────────────────────────► │  4. Read & verify cookie
  │                                    │  5. Inject user identity context
```
*Note: Layout shells enforce client-side UI visibility, while API route endpoints validate JWT authorization server-side for secure CRUD operations.*
