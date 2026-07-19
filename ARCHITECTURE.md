# Project Architecture

Next.js (App Router) + TypeScript, feature-based organization.

```
src/
├── app/                  # App Router: routes, layouts, pages
│   ├── (auth)/           # Route group — auth pages (login, register)
│   ├── (marketing)/      # Route group — public/marketing pages
│   ├── (dashboard)/      # Route group — authenticated app
│   └── api/              # Route handlers (backend endpoints)
│
├── components/           # Reusable React components
│   ├── ui/               # Design-system primitives (Button, Input, Card)
│   ├── layout/           # Structural components (Header, Sidebar, Footer)
│   └── common/           # Shared composite components
│
├── features/            # Self-contained feature modules
│                         #   e.g. features/auth/{components,hooks,api,types}
│
├── hooks/               # Global custom React hooks
├── lib/                 # Third-party client setup (db, auth, api clients)
├── services/            # Data-fetching / business logic layer
├── store/               # Global state (Zustand / Redux / etc.)
├── context/             # React context providers
├── utils/               # Pure helper functions
├── types/               # Shared TypeScript types & interfaces
├── config/             # App configuration (env, routes, site metadata)
├── constants/          # App-wide constant values
├── styles/             # Global styles / Tailwind layers
└── middleware/         # Edge/middleware helpers

public/                 # Static assets (images, icons, fonts)
tests/                  # unit / integration / e2e
```

## Conventions

- **Feature-first**: colocate a feature's components, hooks, and logic under `features/<name>/`. Promote to top-level `components/` or `hooks/` only when shared across features.
- **`components/ui`** holds dumb, presentational primitives with no business logic.
- **`services/`** is the only layer that talks to APIs/DB; components consume it via hooks.
- **`lib/`** = configured singletons (e.g. `lib/db.ts`, `lib/auth.ts`).
- Route groups `(...)` organize the App Router without affecting URLs.
