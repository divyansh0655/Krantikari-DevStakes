# System Architecture

MDOffline operates as an entirely decoupled Offline-First progressive web application.

## 1. Core State & Data Logic
Data storage strictly relies upon the native `IndexedDB` browser schema. We use `Dexie.js` natively to isolate exact CRUD endpoints cleanly:
- `db.notes`: Main entity tracking Markdown chunks, title definitions, and mapped logic.
- `db.folders`: Logical hierarchy wrapper to query inside Note tables.

## 2. Global Event Store (Zustand)
`noteStore` and `folderStore` exist as reactive Single-Truth objects tracking IndexedDB. Components simply consume specific data bounds out of Zustand avoiding aggressive props drilling.

## 3. Editor Cycle
`draft-js` abstracts rich-text layouts.
We rely on `convertFromRaw` tracking blocks across DOM memory. The real-time mapping dynamically queries `.getPlainText()` across `draft-js` outputting explicit markup to the `marked` library, generating identical visual parsing side-by-side!

## 4. Workbox & Service Workers
Because users might hit `CMD+W` fast, we rely natively on `vite-plugin-pwa` managing caching of static JS chunks immediately locally! A secondary script bounded to `useAutoSave` explicitly interrupts unload queues via `beforeunload` ensuring `IndexedDB.update()` finishes cleanly natively avoiding race condition crashes.
