# Change Log

| change_id | date | goal_id | alignment | summary | verification | decision |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-02-18-governance-bootstrap | 2026-02-18 | DOC-BOOTSTRAP-001 | direct | Added AGENTS governance docs, playbook submodule, and validation script. | local doc validation script executed | approved |
| 2026-02-18-web-alpha-kickoff-session | 2026-02-18 | WEB-ALPHA-001 | direct | Started Alpha P0 session persistence and dashboard auto-land implementation. | Stakeholder-approved kickoff alignment review | approved |
| 2026-02-18-web-alpha-kickoff-providers | 2026-02-18 | WEB-ALPHA-002 | direct | Started Alpha P0 provider state indicator and persistence UX updates. | Stakeholder-approved kickoff alignment review | approved |
| 2026-02-18-web-alpha-kickoff-suggestions | 2026-02-18 | WEB-ALPHA-003 | direct | Started Alpha suggestion source visibility and confidence-hide UI updates. | Stakeholder-approved kickoff alignment review | approved |
| 2026-02-18-web-alpha-session-routing | 2026-02-18 | WEB-ALPHA-001 | direct | Added authenticated redirect behavior so return visits land on the dashboard instead of the login page. | npm run build | approved |
| 2026-02-18-web-alpha-provider-indicator | 2026-02-18 | WEB-ALPHA-002 | direct | Updated profile menu with live Gmail/Outlook connection indicators and direct provider connect flows. | npm run build | approved |
| 2026-02-18-web-alpha-suggestion-source | 2026-02-18 | WEB-ALPHA-003 | direct | Updated suggestion UI to show inbox source label and removed confidence score display. | npm run build | approved |
| 2026-02-18-web-suggestion-context-guidance | 2026-02-18 | WEB-ALPHA-003 | direct | Updated AI suggestion hooks/API wiring to consume context metadata and show no-provider/insufficient-history guidance in empty states. | npm run build | approved |
| 2026-02-18-web-provider-status-proxy-fix | 2026-02-18 | WEB-ALPHA-002 | direct | Fixed Vite dev proxy routing for `/me` so provider status requests reach Auth-API instead of returning frontend 404 fallback states. | npm run build | approved |

| 2026-02-18-governance-followup-automation | 2026-02-18 | DOC-BOOTSTRAP-001 | direct | Repaired governance markdown corruption and added branch-protection follow-up runbook plus automation script for required status checks. | node tools/agents/validate-governance.mjs; powershell PSParser syntax check for tools/agents/configure-branch-protection.ps1 | approved |
| 2026-02-19-client-frontend-docs-rephrase | 2026-02-19 | DOC-BOOTSTRAP-001 | direct | Rephrased frontend governance docs with current stack, folder structure, UX guardrails, and cross-references to API/UX sources. | node tools/agents/validate-governance.mjs | approved |
| 2026-02-19-web-beta-privacy-controls | 2026-02-19 | WEB-BETA-003 | direct | Added profile-menu privacy controls for JSON data export and confirmed account deletion, wired to new backend `/me/privacy/*` endpoints. | npm run build | approved |
| 2026-02-19-web-beta-notes-ocr-deferral | 2026-02-19 | WEB-BETA-002 | direct | Updated repo goal criteria to formalize Beta scope as Notes-only and defer OCR to mobile phase planning. | node tools/agents/validate-governance.mjs | approved |
| 2026-02-19-web-beta-notes-phase-1 | 2026-02-19 | WEB-BETA-002 | direct | Implemented Notes Phase 1 UI: notes routes/pages, reusable rich note editor + protection flows, top-nav Notes entry, list/grid preference behavior, and Todo modal Add Notes (new + link existing) integration. | npm run build | approved |

## Change Entry Contract

- alignment: `direct` or `partial` or `none`
- decision: `approved` or `revise` or `blocked`


