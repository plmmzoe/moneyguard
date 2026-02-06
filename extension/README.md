# MoneyGuard Chrome Extension

Chrome Extension (Manifest V3) that reuses the web app’s auth: same Sign up / Log in flow and shared auth state via Supabase and `chrome.storage.local`.

## Extension function by page / surface

| Surface | Where it appears | Function |
|--------|-------------------|----------|
| **Popup** | Clicking the extension icon in the toolbar | **Account**: Log in, Sign up, view signed-in email, Log out. Uses shared Supabase auth; session is stored in `chrome.storage.local` so the extension and web app stay in sync. |
| **Content script** | Injected on every page (`<all_urls>`) | Listens for **purchase-intent** (URL path contains e.g. `checkout`, `buy`, `purchase`, `payment`, `order`, `pay`, `cart`, `bag`, `basket`). When detected, shows the **Permission UI** overlay. |
| **Permission UI** (overlay) | Injected into the page by the content script when purchase intent is detected | Asks: “MoneyGuard detected a purchase. Do you want AI to analyze this purchase before you buy?” **Ignore** closes the overlay; **Analyze** starts the analysis flow (loads user + profile, then **Loading UI** → Gemini analysis → **Analysis UI**). |
| **Loading UI** (overlay) | Shown while the page is being analyzed | Message: “Loading – Take some time right now to reconsider your purchase.” Shown until Gemini returns cart items + analysis. |
| **Analysis UI** (overlay) | Shown after Gemini returns | Shows: percentage of monthly budget used by the cart total, short AI analysis text, and “Total Amount Saved using MoneyTracker.” Buttons: **Ignore budget** (log as purchased → adds transactions in Supabase, closes overlay); **Save money** (update “savings” via RPC, close overlay, then **PREV_TAB** to go back). |
| **Toast UI** | Injected on the page for errors / notices | Short-lived message (e.g. “please login and refresh to use MoneyTracker”, “Gemini busy, please refresh and try again”, profile or logging errors). Auto-removed after a few seconds. |
| **Background (service worker)** | Runs in the extension’s background context | Handles messages from the content script: **GET_USER** (current Supabase user), **GET_PROFILE** (profile by user id), **ADD_TRANSACTION** (insert transactions), **UPDATE_SAVINGS** (RPC `increment`), **PREV_TAB** (navigate tab back). Can also handle **OPEN_ANALYSIS** to open the web app’s `/analyze` in a popup window (item/price passed as query params). |

End-to-end flow on a checkout-like page: **Detect** (content) → **Permission UI** → user taps Analyze → **Loading UI** → background provides user + profile → **Gemini** parses cart and analyzes → **Analysis UI** → user chooses “Ignore budget” (log purchase) or “Save money” (update savings + go back).

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

## Logo and icons

The popup uses `extension/icons/logo.svg` (a copy of `public/logo.svg`) in the header. Keep it in sync with the main app logo when the design changes.

### Optional: toolbar icon (PNG)

To set a custom icon in the browser toolbar, add under `extension/`:

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
