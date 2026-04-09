# MDOffline - Progressive Note Taking App

MDOffline is an aggressive Offline-First markdown editor, designed entirely focusing on zero-latency saving ensuring users never drop a keystroke. 

## Key Features
- **Offline First**: PWA native routing powered natively by Service-Workers ensuring the application is perfectly usable alongside zero-latency IDB transactions.
- **Zero Data Loss**: Robust `beforeunload` boundary-layer hooks bound seamlessly to `dexie.js` debouncer hooks. Clashing edits are flushed strictly ensuring persistence regardless of unexpected browser interrupts.
- **Organization Mechanics**: Fully recursive folder-trees mapped locally inside the sidebar. 
- **Keyboard Traversal**: Rapid application traversal mapped to `<App>` via global listeners isolating UX complexity. 
- **Theming**: Integrated Dark Mode toggle mapped securely. 
- **Data Egress**: Supports raw `.md` blob transfers natively preventing third-party platform lock-in.

## Quick Start
```bash
cd frontend
npm install
npm run dev
```

## Running Tests
```bash
npm run test
```
