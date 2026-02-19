# Goals Agent Rules (client)

## Purpose

Ensure every repository change stays aligned to approved goals, release stage, and frontend quality standards.

## Goal Gate Rules

1. Assign exactly one primary `goal_id` per meaningful change.
2. Allowed alignment values:
- `direct`
- `partial`
- `none`
3. If alignment is `partial` or `none`, ask the user and record the question before approval.
4. If no valid `goal_id` exists, mark decision as `blocked`.
5. Verification evidence is mandatory before `approved`.

## Frontend Delivery Rules

1. Prefer modular, reusable components and avoid duplicated UI logic.
2. Keep styling consistent with shared theme tokens and existing component patterns.
3. Favor small focused components and hooks over large mixed-responsibility files.
4. Preserve demo-critical UX flows: auth return path, provider visibility, suggestions, and tool-linked actions.
5. Keep desktop and mobile behavior reliable for all user-facing changes.

## UI/UX Quality Rules

1. Typography hierarchy should use limited size/weight steps; captions use the smallest readable style.
2. Color usage should stay within one neutral base plus limited accents.
3. Spacing should follow 4px increments and support readable rhythm.
4. Long content streams should use fixed-height containers with internal scrolling.
5. Loading states should use skeletons or equivalent placeholders.
6. Clickable elements should always have visible hover/focus feedback.
7. Accessibility baseline is mandatory: semantic structure, keyboard support, and ARIA where needed.

## Verification Evidence

At least one is required:

- Tests passed
- Build passed
- Manual validation steps with outcome
- Contract or schema validation notes
- UI verification notes for responsive and accessibility checks

## Change Entry Contract

Every change entry must include:

- `change_id`
- `date`
- `goal_id`
- `alignment`
- `summary`
- `verification`
- `decision`
