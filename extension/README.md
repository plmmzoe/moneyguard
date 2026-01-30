# MoneyGuard Chrome Extension

Chrome Extension (Manifest V3) that reuses the web app’s auth: same Sign up / Log in flow and shared auth state via Supabase and `chrome.storage.local`.

## File tree

```
extension/
├── manifest.json           # MV3 manifest
├── popup.html              # Popup entry
├── popup/
│   ├── popup.tsx           # Popup entry script
│   ├── PopupApp.tsx        # Popup UI (Login / Signup / user state)
│   └── popup.css           # Popup styles
├── scripts/
│   ├── background.ts       # Service worker
│   └── supabase-extension.ts  # Supabase client + chrome.storage persistence
├── copy-manifest.mjs      # Post-build: copy manifest + flatten output
├── vite.config.ts         # Vite build for extension
├── tsconfig.json
└── README.md               # This file
```

Shared auth (used by both web app and extension):

```
shared/
└── auth/
    ├── index.ts
    ├── types.ts    # AuthCredentials, validatePassword, MIN_PASSWORD_LENGTH
    └── api.ts      # createAuthApi(supabase) → signIn, signUp, signOut, getSession
```

Build output:

```
dist-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
└── background.js
```

## Prerequisites

- Same Supabase project as the web app.
- `.env` or `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  (The extension build reads these so the popup uses the same Supabase project.)

## Build

From the repo root:

```bash
npm run build:extension
```

This:

1. Runs `vite build --config extension/vite.config.ts` (builds popup + background).
2. Runs `node extension/copy-manifest.mjs` (copies `manifest.json` into `dist-extension` and flattens output if needed).

The loadable extension lives in **`dist-extension/`**.

## Load the extension in Chrome

1. Build: `npm run build:extension`.
2. Open Chrome and go to `chrome://extensions/`.
3. Turn **Developer mode** on (top right).
4. Click **Load unpacked**.
5. Choose the **`dist-extension`** folder (at the repo root).
6. The MoneyGuard extension should appear; click its icon to open the popup.

## Behavior

- **Not logged in**  
  Popup shows **Log in** and **Sign up**.  
  Tapping one shows email/password; submit uses the shared auth API (Supabase). Session is stored in `chrome.storage.local` and kept in sync with Supabase.

- **Logged in**  
  Popup shows the user’s email and a **Log out** button.  
  Log out clears the session in Supabase and in `chrome.storage.local`.

Auth logic is shared via `shared/auth`; the web app uses the same `createAuthApi(supabase)` (with server Supabase client), and the extension uses it with a browser Supabase client that persists session to `chrome.storage.local`.

## Optional: extension icons

To set a custom icon, add under `extension/`:

- `icons/icon16.png` (16×16)
- `icons/icon48.png` (48×48)
- `icons/icon128.png` (128×128)

Then in `manifest.json` add under `action`:

```json
"default_icon": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

Rebuild and reload the extension.
