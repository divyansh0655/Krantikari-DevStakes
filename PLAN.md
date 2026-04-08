# 📝 MarkDown Offline — Project Plan

## Offline-First Markdown Note-Taking App

> A distraction-free, highly performant note-taking application designed for developers and students, capable of working entirely offline. A lightweight Notion/Obsidian alternative tailored for rapid class notes or code snippets.

---

## Team — Krantikari

| # | Member           | Role                        |
|---|------------------|-----------------------------|
| 1 | Virottam Dutt Raturi | Frontend Lead / Editor UX  |
| 2 | Divyansh Bhargav     | Architecture / Service Worker & IndexedDB |
| 3 | Aryan Kumar          | UI/UX Design / Shadcn Components |
| 4 | Lakshya Kumar        | Testing / QA / DevOps      |
| 5 | Manasvi Sharma       | Documentation / PWA & Sync Logic |

---

## Tech Stack

| Layer              | Technology                                                    |
|--------------------|---------------------------------------------------------------|
| **Framework**      | React 18+ (Vite)                                              |
| **UI Components**  | shadcn/ui + Radix Primitives                                  |
| **Rich Text Editor** | Draft.js (bold, italics, headings, lists, inline code)      |
| **Markdown Parsing** | `marked` / `markdown-it` (MD → HTML real-time preview)      |
| **Offline Storage** | IndexedDB via `idb` (Dexie.js wrapper)                       |
| **Background Sync** | Service Worker (Workbox)                                     |
| **Styling**        | Tailwind CSS 3 + CSS Variables for theming                    |
| **State Mgmt**     | Zustand (lightweight, no boilerplate)                        |
| **Build / Dev**    | Vite 5, ESLint, Prettier                                     |
| **Testing**        | Vitest + React Testing Library + Playwright (E2E)            |
| **Deployment**     | Vercel / Netlify (static PWA)                                 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  React App   │   │  Draft.js    │   │  shadcn/ui     │  │
│  │  (Zustand)   │◄─►│  Editor      │   │  Components    │  │
│  └──────┬───────┘   └──────────────┘   └────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              IndexedDB  (via Dexie.js)               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │   │
│  │  │  Notes   │  │  Folders │  │  Sync Queue       │  │   │
│  │  │  Table   │  │  Table   │  │  (pending ops)    │  │   │
│  │  └──────────┘  └──────────┘  └───────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Service Worker  (Workbox)                  │   │
│  │  • Cache-first for static assets                     │   │
│  │  • Background sync for pending writes                │   │
│  │  • Offline fallback page                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User types** → Draft.js captures rich-text edits  
2. **Auto-save** → Debounced (500ms) write to IndexedDB  
3. **Real-time preview** → Markdown content is parsed to HTML via `marked`  
4. **Service Worker** → Caches all assets; queues sync operations  
5. **Tab close / offline** → IndexedDB persists everything; zero data loss  

---

## One-Month Sprint Plan

### 📅 Timeline: April 8, 2026 — May 8, 2026

---

### 🏁 Week 0 — Kickoff & Setup (Apr 8 – Apr 10, 3 days)

**Goal:** Project bootstrapping, tooling, and team alignment.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Initialize Vite + React project | Divyansh | Working `npm run dev` scaffold |
| Configure Tailwind CSS + shadcn/ui | Aryan | Theme tokens, dark/light mode toggle |
| Set up ESLint, Prettier, Husky pre-commit hooks | Lakshya | `.eslintrc`, `.prettierrc`, git hooks |
| Set up GitHub repo, branch strategy (`main`, `dev`, feature branches) | Lakshya | Protected `main`, PR template |
| Create Figma wireframes / low-fi mockups (sidebar, editor, preview) | Aryan | Figma link shared with team |
| Research Draft.js API, plugins, and decorator patterns | Virottam | Short technical spike document |
| Document IndexedDB schema design (notes, folders, tags) | Divyansh | Schema diagram in `docs/` |
| Write project README with setup instructions | Manasvi | Updated `README.md` |

**Milestone:** Dev environment running for all 5 members. Schema + wireframes reviewed.

---

### 🔨 Week 1 — Core Editor & Storage (Apr 11 – Apr 17)

**Goal:** A working Draft.js editor that persists notes to IndexedDB.

#### Sprint Backlog

| # | User Story | Tasks | Owner | Points |
|---|-----------|-------|-------|--------|
| 1 | As a user, I can create a new note | • "New Note" button in sidebar<br>• Generate UUID, default title "Untitled"<br>• Insert into IndexedDB `notes` table | Virottam + Divyansh | 5 |
| 2 | As a user, I can type rich text (bold, italic, headings, code) | • Integrate Draft.js with custom toolbar<br>• Map keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)<br>• Style toolbar with shadcn Button/Toggle | Virottam + Aryan | 8 |
| 3 | As a user, my notes auto-save as I type | • Debounced save hook (500ms)<br>• Serialize Draft.js ContentState → raw JSON<br>• Write to IndexedDB via Dexie.js | Divyansh | 5 |
| 4 | As a user, I can see a list of all my notes in a sidebar | • Sidebar component with shadcn ScrollArea<br>• Sort by `updatedAt` descending<br>• Click to load note into editor | Aryan | 5 |
| 5 | As a user, I can delete a note | • Swipe-to-delete or context menu<br>• Soft delete (flag) in IndexedDB<br>• Confirmation dialog (shadcn AlertDialog) | Manasvi | 3 |

#### IndexedDB Schema (Dexie.js)

```javascript
// db.js
import Dexie from 'dexie';

const db = new Dexie('MarkdownNotesDB');

db.version(1).stores({
  notes: '++id, title, folderId, createdAt, updatedAt, isDeleted',
  folders: '++id, name, parentId, createdAt',
  syncQueue: '++id, operation, entityType, entityId, timestamp, payload'
});

export default db;
```

#### Key Components

```
src/
├── components/
│   ├── editor/
│   │   ├── MarkdownEditor.jsx      ← Draft.js wrapper
│   │   ├── EditorToolbar.jsx        ← Bold/Italic/H1-H3/Code toggles
│   │   └── MarkdownPreview.jsx      ← Real-time HTML preview
│   ├── sidebar/
│   │   ├── NotesList.jsx            ← All notes list
│   │   ├── NoteItem.jsx             ← Single note row
│   │   └── FolderTree.jsx           ← Folder hierarchy
│   └── ui/                          ← shadcn components (auto-generated)
├── hooks/
│   ├── useAutoSave.js               ← Debounced IndexedDB writer
│   ├── useNotes.js                  ← CRUD operations
│   └── useOfflineStatus.js          ← Online/offline detection
├── lib/
│   ├── db.js                        ← Dexie.js database definition
│   ├── markdown.js                  ← marked/markdown-it config
│   └── utils.js                     ← shadcn utility (cn function)
├── store/
│   └── noteStore.js                 ← Zustand store
└── App.jsx
```

**Milestone:** User can create, edit (rich text), and delete notes. All data persists in IndexedDB across page refreshes.

---

### 🌐 Week 2 — Offline-First & PWA (Apr 18 – Apr 24)

**Goal:** Full offline capability — Service Worker caching, PWA install, zero keystroke loss guarantee.

#### Sprint Backlog

| # | User Story | Tasks | Owner | Points |
|---|-----------|-------|-------|--------|
| 6 | As a user, I can use the app with no internet | • Register Workbox Service Worker<br>• Cache-first strategy for all static assets<br>• Offline fallback for navigation | Divyansh | 8 |
| 7 | As a user, I can install the app as a PWA | • Create `manifest.json` (icons, theme color, display: standalone)<br>• Add install prompt banner<br>• Test on Chrome, Edge, mobile | Manasvi | 3 |
| 8 | As a user, I never lose a keystroke | • Verify IndexedDB writes survive: tab close, browser crash, airplane mode<br>• Add `beforeunload` flush for pending saves<br>• Write E2E test simulating offline scenario | Divyansh + Lakshya | 5 |
| 9 | As a user, I see a clear indicator when I'm offline | • `useOfflineStatus` hook (navigator.onLine + event listeners)<br>• Subtle banner/badge: "Offline — changes saved locally"<br>• Animate transition online ↔ offline | Aryan | 3 |
| 10 | As a user, I can see a live Markdown preview side-by-side | • Split-pane layout (editor left, preview right)<br>• Parse Draft.js ContentState → Markdown string → HTML<br>• Syntax-highlighted code blocks in preview (highlight.js) | Virottam | 5 |

#### Service Worker Strategy

```javascript
// service-worker.js (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Pre-cache all Vite build outputs
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

// All other assets — cache first
registerRoute(
  ({ request }) => request.destination === 'script' || 
                    request.destination === 'style',
  new CacheFirst({ cacheName: 'static-resources' })
);
```

#### PWA Manifest

```json
{
  "name": "MarkDown Offline",
  "short_name": "MDOffline",
  "description": "Distraction-free offline markdown notes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Milestone:** App installs as PWA, works fully offline, and passes Lighthouse PWA audit ≥ 90.

---

### ✨ Week 3 — Features & Polish (Apr 25 – May 1)

**Goal:** Folder organization, search, theming, keyboard-driven UX, and performance optimization.

#### Sprint Backlog

| # | User Story | Tasks | Owner | Points |
|---|-----------|-------|-------|--------|
| 11 | As a user, I can organize notes into folders | • Folder CRUD (create, rename, delete)<br>• Drag-and-drop notes into folders (dnd-kit)<br>• FolderTree component with expand/collapse | Aryan + Manasvi | 5 |
| 12 | As a user, I can search across all my notes | • Full-text search over IndexedDB (cursor iteration or lunr.js index)<br>• Search bar in sidebar with shadcn Input<br>• Highlight matching terms in results | Virottam | 5 |
| 13 | As a user, I can toggle dark/light theme | • CSS variables-based theming<br>• shadcn theme provider (next-themes)<br>• Persist preference in localStorage | Aryan | 3 |
| 14 | As a user, I can use keyboard shortcuts throughout | • `Ctrl+N` — New note<br>• `Ctrl+S` — Force save<br>• `Ctrl+P` — Toggle preview<br>• `Ctrl+Shift+F` — Focus search<br>• `Ctrl+/` — Shortcut cheat sheet modal | Virottam | 3 |
| 15 | As a user, I can export a note as `.md` file | • Generate Markdown string from Draft.js state<br>• Trigger browser download via Blob + URL.createObjectURL<br>• Export button in editor toolbar | Manasvi | 2 |
| 16 | As a user, I can import a `.md` file as a new note | • File input accepting `.md`<br>• Parse Markdown → Draft.js ContentState<br>• Create note in IndexedDB | Manasvi | 3 |
| 17 | As a dev, the app loads in < 2 seconds on 3G | • Code-split editor and preview (React.lazy)<br>• Optimize Vite build (tree-shaking, chunk splitting)<br>• Measure with Lighthouse | Lakshya + Divyansh | 3 |

#### Keyboard Shortcut Architecture

```javascript
// hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

const shortcuts = {
  'ctrl+n': 'newNote',
  'ctrl+s': 'forceSave',
  'ctrl+p': 'togglePreview',
  'ctrl+shift+f': 'focusSearch',
  'ctrl+/': 'showShortcuts',
};

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handler = (e) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');
      
      if (shortcuts[key] && handlers[shortcuts[key]]) {
        e.preventDefault();
        handlers[shortcuts[key]]();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}
```

**Milestone:** Full-featured note-taking app with folders, search, theming, keyboard shortcuts, and import/export.

---

### 🧪 Week 4 — Testing, Hardening & Deployment (May 2 – May 8)

**Goal:** Comprehensive testing, bug fixes, performance benchmarks, documentation, and production deployment.

#### Sprint Backlog

| # | Task | Owner | Details |
|---|------|-------|---------|
| 18 | Unit tests for all hooks | Lakshya | `useAutoSave`, `useNotes`, `useOfflineStatus`, `useKeyboardShortcuts` — Vitest |
| 19 | Component tests for editor | Lakshya + Virottam | Draft.js toolbar toggles, preview rendering, sidebar interactions — RTL |
| 20 | E2E tests for critical flows | Lakshya | Playwright: create note → edit → close tab → reopen → verify data |
| 21 | Offline E2E test | Lakshya + Divyansh | Playwright: go offline → create note → go online → verify persistence |
| 22 | Lighthouse audit & fixes | Divyansh | Target: Performance ≥ 90, PWA ≥ 90, Accessibility ≥ 90 |
| 23 | Cross-browser testing | Manasvi | Chrome, Firefox, Edge, Safari (macOS), Android Chrome |
| 24 | Accessibility audit | Aryan | Keyboard navigation, ARIA labels, color contrast (WCAG AA) |
| 25 | Final documentation | Manasvi | README, CONTRIBUTING.md, architecture docs, JSDoc comments |
| 26 | Deploy to Vercel | Lakshya | CI/CD pipeline, preview deploys on PRs, production on `main` |
| 27 | Demo video & presentation | All | 3-minute walkthrough video, slide deck for project submission |

#### Testing Strategy

```
Tests/
├── unit/
│   ├── hooks/
│   │   ├── useAutoSave.test.js
│   │   ├── useNotes.test.js
│   │   └── useOfflineStatus.test.js
│   └── lib/
│       ├── db.test.js
│       └── markdown.test.js
├── component/
│   ├── MarkdownEditor.test.jsx
│   ├── EditorToolbar.test.jsx
│   ├── NotesList.test.jsx
│   └── FolderTree.test.jsx
└── e2e/
    ├── create-note.spec.js
    ├── offline-persistence.spec.js
    ├── search.spec.js
    └── export-import.spec.js
```

#### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Milestone:** App deployed to production. All tests passing. Documentation complete. Demo-ready.

---

## 📊 Sprint Velocity & Burndown Target

| Week | Planned Points | Stretch Goal |
|------|---------------|--------------|
| Week 0 | — (setup) | — |
| Week 1 | 26 | 30 |
| Week 2 | 24 | 28 |
| Week 3 | 24 | 28 |
| Week 4 | — (testing/deploy) | — |
| **Total** | **74** | **86** |

---

## 🚀 Key Milestones

| Date | Milestone | Acceptance Criteria |
|------|-----------|-------------------|
| Apr 10 | **M0 — Project Bootstrap** | All devs can `npm run dev`, wireframes approved |
| Apr 17 | **M1 — Core Editor** | Create/edit/delete notes, rich text, IndexedDB persistence |
| Apr 24 | **M2 — Offline-First** | PWA installable, works offline, Lighthouse PWA ≥ 90 |
| May 1  | **M3 — Feature Complete** | Folders, search, themes, shortcuts, import/export |
| May 8  | **M4 — Ship It** | All tests green, deployed, demo video recorded |

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Draft.js learning curve / deprecation concerns | Medium | High | Spike in Week 0; fallback to Slate.js or TipTap if blockers found by Apr 12 |
| IndexedDB data corruption on browser updates | Low | Critical | Dexie.js handles migrations; add version checks; nightly backup export |
| Service Worker caching stale assets | Medium | Medium | Workbox versioned precaching; `skipWaiting()` + `clientsClaim()` |
| Team member unavailable | Medium | Medium | Each feature has a primary + secondary owner; document everything |
| Scope creep (real-time collab, cloud sync) | High | Medium | Strictly defer to v2; keep PLAN.md as the source of truth |

---

## 🔮 Future Scope (v2 — NOT in this sprint)

These features are explicitly **out of scope** for the 1-month timeline:

- [ ] Cloud sync (Firebase / Supabase backend)
- [ ] Real-time collaboration (CRDT / Yjs)
- [ ] Tags and advanced filtering
- [ ] Vim / Emacs keybindings
- [ ] Plugin system
- [ ] Mobile-native app (Capacitor / React Native)
- [ ] AI-powered note summarization
- [ ] Spaced repetition flashcards from notes

---

## 📁 Final Project Structure

```
Krantikari-DevStakes/
├── frontend/
│   ├── public/
│   │   ├── icons/                   ← PWA icons
│   │   ├── manifest.json            ← PWA manifest
│   │   └── sw.js                    ← Service Worker (Workbox generated)
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── MarkdownEditor.jsx
│   │   │   │   ├── EditorToolbar.jsx
│   │   │   │   └── MarkdownPreview.jsx
│   │   │   ├── sidebar/
│   │   │   │   ├── NotesList.jsx
│   │   │   │   ├── NoteItem.jsx
│   │   │   │   └── FolderTree.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.jsx
│   │   │   │   └── StatusBar.jsx
│   │   │   └── ui/                  ← shadcn auto-generated
│   │   ├── hooks/
│   │   │   ├── useAutoSave.js
│   │   │   ├── useNotes.js
│   │   │   ├── useOfflineStatus.js
│   │   │   └── useKeyboardShortcuts.js
│   │   ├── lib/
│   │   │   ├── db.js                ← Dexie.js schema
│   │   │   ├── markdown.js          ← Parser config
│   │   │   └── utils.js
│   │   ├── store/
│   │   │   └── noteStore.js         ← Zustand
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   │   ├── unit/
│   │   ├── component/
│   │   └── e2e/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docs/
│   ├── architecture.md
│   ├── schema.md
│   └── wireframes/
├── .github/
│   └── workflows/
│       └── ci.yml
├── PLAN.md                          ← This file
├── README.md
└── .gitignore
```

---

## ✅ Definition of Done

A feature is "done" when:

1. ✅ Code is merged to `dev` via approved PR (≥ 1 reviewer)
2. ✅ Unit / component tests written and passing
3. ✅ No ESLint warnings or errors
4. ✅ Tested manually on Chrome + one other browser
5. ✅ Works offline (where applicable)
6. ✅ Accessible via keyboard
7. ✅ Documented (JSDoc + README update if user-facing)

---

*Last updated: April 8, 2026 — Team Krantikari*
