# Repo Scope (client)

Web frontend SPA for authentication, task management, AI suggestions, provider controls, billing, and privacy settings.

## Frontend Stack (Current)

- Framework/runtime: React 18 + TypeScript
- Build/dev: Vite 5
- Routing: React Router 6
- UI system: Material UI (MUI) + Emotion
- Data layer: TanStack React Query
- Icons/table: MUI Icons and MUI X Data Grid

Reference only (future migration path if approved): Next.js + TailwindCSS + shadcn/ui + Lucide + Zustand.

## Folder Structure (Current)

```text
/src
  /app
    /config
    /providers
  /api
  /auth
  /components
    /feedback
    /integrations
    /layout
    /todos
  /features
    /admin
    /aiSuggestions
    /integrations
    /todos
  /pages
  /utils
```

## Frontend Quality Guardrails

1. Clarity and reuse: extract repeated UI patterns into reusable components/hooks before third duplication.
2. Consistency: use shared theme tokens for color, typography, spacing, elevation, and states.
3. Simplicity: keep components focused; place fetch/mapping logic in feature hooks and helpers.
4. Demo-oriented delivery: preserve fast demos for auth, multi-turn suggestion flows, provider state, and tool integrations.
5. Visual quality: enforce 4px spacing rhythm, explicit hover/focus states, and loading/empty/error states.

## In Scope for Governance

- Goal mapping per change
- Stage based planning (Alpha, Beta, Final)
- Verification evidence tracking
- Screenshot request mapping through `../../../screens/UX_INDEX.md`
- Frontend architecture and UX consistency checks

## Out of Scope for Governance Bootstrap

- Runtime feature implementation
- Infrastructure provisioning beyond docs and checks
- External legal certification artifacts

## Goal Gate

1. Every meaningful change maps to one primary `goal_id` from `docs/agents/GOALS_REPO.md`.
2. If alignment is partial or none, ask user clarification before implementation.
3. Do not mark a change approved without verification evidence.

## Cross References

- `docs/agents/GOALS_REPO.md`
- `docs/agents/GOALS_AGENT.md`
- `docs/agents/RELEASE_STAGES.md`
- `docs/agents/PR_CHECKLIST.md`
- `docs/agents/_core_src/standards/CODING_STANDARDS.md`
- `docs/agents/_core_src/standards/SECURITY_PRIVACY_STANDARDS.md`
- `../../../Auth-API/README.md`
- `../../../screens/UX_INDEX.md`

## Validation Command

`node tools/agents/validate-governance.mjs`
