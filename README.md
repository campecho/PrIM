# PrIM — Print Management Portal

An operational portal for print service providers and their clients to manage
print workflows, assets, specifications, and orders. Built with React 19, Vite,
Tailwind CSS v4, and Firebase (Firestore) for live data sync.

> Imported from a Google AI Studio prototype and refactored into a modular,
> reusable component architecture.

## Modules

- **Program** – program-print customer dashboard, profiles, notes, spec & file assignment
- **Projects** – active / completed project tracking
- **Files** – asset library with status workflows (Pre-flight, Review, Approved, Rejected), filtering, and an import queue
- **Products & Specs** – print specs plus a component resources directory (media, finished sizes, finishing options, colors, impressions)
- **PrintBridge / Orders** – order queue with status flagging and tracking
- **Settings** – global config and Firestore-backed mapping

## Getting started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (code-split, see vite.config.ts)
npm run preview  # preview the production build
npm run lint     # tsc --noEmit type check
```

Firebase configuration lives in `firebase-applet-config.json` and is consumed
by `src/firebase.ts`. Firestore security rules are in `firestore.rules`.

## Project structure

```
src/
  App.tsx                 Application shell (sidebar, header, module router)
  main.tsx                Entry point
  navigation.tsx          Sidebar module definitions
  types.ts                Shared TypeScript types
  index.css               Tailwind theme, fonts, brand tokens

  ui/                     Reusable UI primitive library
    Icon, Button, IconButton, Badge, TextField, Card,
    SegmentedControl, NavButton, cn()
    SearchBar, StandardDrawer, StandardModal,
    TableActionMenu, TruncateWithTooltip, AutocompleteInput
    index.ts              Barrel — import everything from "./ui"

  modules/                One file per top-level module
  components/             Shared components (FileImportCard, FakeLoginOverlay)
  components/drawers/     One file per detail/edit drawer
  hooks/                  useFirestoreSync
  context/                ProductionTypesContext
  lib/                    format helpers, XLSX/PDF portability
  data/                   mock data, print-spec catalog, option lists, media/sizes
```

### UI consistency

All buttons, icons, inputs, badges, and the sidebar nav are built from the
`src/ui` primitive library, so styling and behaviour stay consistent across
modules. The shared `StandardDrawer` and `StandardModal` shells wrap every
detail panel, so new drawers automatically inherit the standard layout,
animation, and footer actions. Prefer importing from `./ui` over hand-writing
Tailwind utility strings for these elements.

### Build / performance

Each module is lazy-loaded (`React.lazy`), and heavy third-party libraries
(firebase, pdf-lib, xlsx, react-datepicker, motion) are split into their own
vendor chunks via `manualChunks`, keeping the initial bundle small.
