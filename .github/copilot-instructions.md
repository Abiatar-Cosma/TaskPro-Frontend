# Copilot instructions for TaskPro-Frontend

This file gives an actionable summary so an AI coding assistant can be productive quickly in this repository.

Please keep suggestions and generated changes small and localized. Always run and prefer existing tests and lints.

Key points:

- Project type: React (Create React App) single-page app. Entrypoint: `src/index.js`.
- Routing: `react-router-dom` (v6+). Top-level routes are in `src/components/App/App.jsx` using lazy-loaded pages and `PrivateRoute` / `PublicRoute` wrappers.
- State: Redux Toolkit + redux-persist. Store is configured in `src/redux/store.js`. Auth slice is persisted (see `auth` persist config).
- API layer: Axios instance at `src/api/axiosInstance.js` with request/response interceptors. Important behaviors:
  - Adds `Authorization: Bearer <accessToken>` from `localStorage` on requests.
  - Performs automatic token refresh when a 401 is received (POST to `ENDPOINTS.auth.refreshToken`). Refresh logic queues concurrent requests and retries them after refresh completes.
  - Rich logging for card-related requests (`/api/cards`) and detailed error logging.
- Endpoints: Centralized in `src/api/endpoints.js` (use these helpers to build URLs).

Repository conventions and patterns to follow:

- Files and imports often use absolute-ish aliases like `components/...`, `pages/...`, `api/...`. Follow existing import style.
- Async actions: use `createAsyncThunk` in `src/redux/*/*Operations.js`. Thunks usually call `axiosInstance` and handle token storage in `localStorage`.
- Tokens are stored in `localStorage` keys `accessToken` and `refreshToken`. Update both when login/register/refresh succeed.
- UI components often rely on small presentational files (e.g., `components/Loader/Loader.js`) and styled-components / emotion for styling.
- i18n: initialized at `src/assets/i18/i18.js`. Use `react-i18next` for strings.

Common tasks / commands:

- Start dev server: `npm start` (uses `react-scripts start`).
- Build for production: `npm run build`.
- Run tests: `npm test` (CRA test runner).
- Lint JS files: `npm run lint:js` (ESLint configured to check `src/**/*.{js,jsx}`).

Important files to inspect when changing features:

- Auth flow: `src/redux/auth/*` (slice, selectors, operations). Also `src/hooks/useAuth.js` and `src/components/App/App.jsx` (app init logic and refreshUser usage).
- Network layer & tokens: `src/api/axiosInstance.js`, `src/api/endpoints.js`, and `src/redux/auth/authOperations.js`.
- State shape and persistence: `src/redux/store.js` and `src/redux/*/*Slice.js`.
- Routing & lazy loading: `src/components/App/App.jsx`, `src/routes/PrivateRoute.jsx`, `src/routes/PublicRoute.jsx`, and `layouts/SharedLayout.jsx`.

Examples (short snippets you can use or adapt):

- To call API endpoints use `axiosInstance` + `ENDPOINTS`, e.g.:
  - `axiosInstance.get(ENDPOINTS.boards.allBoards)`
  - `axiosInstance.post(ENDPOINTS.auth.login, credentials)`

- When writing new async thunks, follow the pattern in `src/redux/auth/authOperations.js`: set headers via `axiosInstance.defaults.headers.common.Authorization` when you obtain a token, store tokens in `localStorage`, and use `toast` for user-facing errors.

Testing and quality gates:

- Ensure `npm run lint:js` passes for changed files. Project uses CRA ESLint defaults.
- The app expects `process.env.REACT_APP_API_URL` optionally for API base URL. When running locally, the default remote backend is used if env var is missing.

Notes and gotchas discovered in the codebase:

- The axios interceptor implements a queuing strategy for refresh tokens; avoid duplicating that logic in thunks — rely on `axiosInstance` to transparently refresh.
- The app reads tokens directly from `localStorage` in multiple places (App init + axios). When adding features that depend on auth state, prefer selectors from `auth` slice or `useAuth` hook.
- Routes expect the SPA to be served at basename `/Task_Pro` in production (see `src/index.js`). Keep this in mind for absolute links.

If anything here is unclear or you'd like additional examples (tests, common refactors, or specific slices), tell me which area to expand and I will iterate.
