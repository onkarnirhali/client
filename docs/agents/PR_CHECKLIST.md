# PR Checklist

- [ ] Primary goal_id exists in `docs/agents/GOALS_REPO.md`.
- [ ] `docs/agents/CHANGE_LOG.md` updated for meaningful changes.
- [ ] Alignment is recorded (`direct`, `partial`, or `none`).
- [ ] If alignment is `partial` or `none`, user question and resolution are documented.
- [ ] Verification evidence is documented.
- [ ] Markdown links validate with `node tools/agents/validate-governance.mjs`.
- [ ] Scope remains within current release stage unless explicitly approved.
- [ ] For meaningful feature changes, an approved feature spec exists in `agents-playbook/workflow/feature-specs/`.
- [ ] Feature spec frontmatter includes `goal_id` and `status: approved`.
- [ ] Feature spec includes click-by-click user flow, behavior coverage, and edge-case coverage.
- [ ] Implementation and verification notes map back to the feature spec acceptance checklist.
- [ ] Repeated UI logic was refactored into reusable component/hook where applicable.
- [ ] Styling follows shared theme/component patterns (no ad hoc visual drift).
- [ ] Loading/empty/error states are present for new or changed async UI.
- [ ] Responsive behavior validated for desktop and mobile.
- [ ] Accessibility checks completed (semantic roles, keyboard flow, labels).
- [ ] API-facing UI changes are consistent with `../../../Auth-API/README.md`.
