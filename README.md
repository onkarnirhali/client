Frontend Architecture Proposal

Summary
- Recommendation: React + Vite + TypeScript + Material UI (MUI) + React Query + React Router.
- Rationale: Fast iteration, large ecosystem, first-class DX, and a free, well-maintained component library. Clean code and reuse via feature modules, hooks, and a small design system.
- Alternative: Angular + Angular Material if you prefer a more opinionated, batteries-included framework with stricter structure.

Stack Options
- React (recommended)
  - Build: Vite + TypeScript
  - UI: Material UI (MUI Core + MUI X for pickers)
  - State: React Query (server state) + local component state; context only for cross-cutting concerns
  - Routing: React Router
  - Forms: React Hook Form + Zod (optional)
- Angular (alternative)
  - Build: Angular CLI + TypeScript
  - UI: Angular Material (free) or Kendo UI (paid)
  - State: RxJS + Signals/Services; NGXS/NGRX if needed
  - Routing: Angular Router

UI Components: Material UI vs Kendo UI
- Material UI (recommended): Free, comprehensive, themeable, strong community. MUI X Pro has paid advanced grid, but pickers are free.
- Kendo UI: Polished enterprise widgets and grid; commercial license; heavier footprint.

Proposed React App Structure
client/
  src/
    main.tsx
    App.tsx
    app/
      routes.tsx
      providers/
        QueryProvider.tsx
        ThemeProvider.tsx
      config/
        env.ts
    auth/
      AuthProvider.tsx
      useAuth.ts
      ProtectedRoute.tsx
    api/
      http.ts
      auth.ts
      todos.ts
    components/
      layout/
        AppLayout.tsx
        TopBar.tsx
        SideNav.tsx
      feedback/
        SnackbarProvider.tsx
        LoadingOverlay.tsx
      todos/
        TodoList.tsx
        TodoItem.tsx
        TodoFilters.tsx
        TodoDialog.tsx
    pages/
      LoginPage.tsx
      DashboardPage.tsx
      NotFoundPage.tsx
    hooks/
      useTodos.ts
    theme/
      index.ts
    utils/
      date.ts
  public/
    index.html
  package.json

Practices
- Feature-oriented folders (auth, todos).
- React Query for server state (cache, background refresh, optimistic updates).
- Thin API layer (api/http.ts) sets credentials: include and base URL from env.
- AuthProvider for /auth/me and login/logout; ProtectedRoute for guarding pages.
- Central MUI theme; shared atoms in theme/ and components/.
- React Hook Form for dialogs; Zod for schema validation (optional).

Auth Flow (Cookies)
- Backend sets accessToken and refreshToken httpOnly cookies.
- Fetch with credentials: include; on 401 try /auth/refresh, then retry; if still unauthorized, redirect to /login.

Initial Milestones
- M1: Scaffold Vite + TS; install react, react-dom, @mui/material, @mui/icons-material, @mui/x-date-pickers, @tanstack/react-query, react-router-dom.
- M2: App shell: ThemeProvider, QueryProvider, routing.
- M3: Auth provider + Google sign-in (link to /auth/google) + /auth/me.
- M4: Todos list + dialog + filters wired to API.
- M5: Snackbar notifications + loading states.

Angular Alternative
- Use Angular CLI, Angular Material, feature modules, route guards, and services; same feature-oriented structure.

Recommendation
- React + MUI for fastest path with clean, reusable code.
