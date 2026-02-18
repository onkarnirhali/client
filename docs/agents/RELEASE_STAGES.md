# Repo Goals

| goal_id | global_goal_id | priority | stage | status | owner | success_criteria |
| --- | --- | --- | --- | --- | --- | --- |
| DOC-BOOTSTRAP-001 | G-ALPHA-005 | P0 | Alpha | active | web-platform | Governance docs and checks are present and valid. |
| WEB-ALPHA-001 | G-ALPHA-002 | P0 | Alpha | active | web | Returning authenticated users land on dashboard automatically. |
| WEB-ALPHA-002 | G-ALPHA-003 | P0 | Alpha | active | web | Connection state indicators in profile menu are correct. |
| WEB-ALPHA-003 | G-ALPHA-004 | P1 | Alpha | active | web | Suggestion source is shown and confidence score is hidden. |
| WEB-BETA-001 | G-BETA-003 | P0 | Beta | planned | web | Billing and entitlement UI are production ready. |
| WEB-BETA-002 | G-BETA-002 | P1 | Beta | planned | web | Note taker and OCR UI flow are implemented. |
| WEB-BETA-003 | G-BETA-001 | P0 | Beta | planned | web | Privacy controls for export and delete are user accessible. |
| WEB-FINAL-001 | G-FINAL-003 | P0 | Final | planned | web | Web performance and reliability meet launch targets. |

## Goal Entry Contract

Each goal entry must include:

- goal_id
- priority
- stage
- status
- owner
- success_criteria
"@ | Set-Content -Path 'docs/agents/GOALS_REPO.md'

  @"
# Goals Agent Rules (client)

## Purpose

Ensure every repository change stays aligned to approved goals and release stage.

## Goal Gate Rules

1. Assign exactly one primary goal_id per meaningful change.
2. Allowed alignment values:
- direct
- partial
- 
one
3. If alignment is partial or 
one, ask the user and record the question before approval.
4. If no valid goal_id exists, mark decision as locked.
5. Verification evidence is mandatory before pproved.

## Verification Evidence

At least one is required:

- Tests passed
- Build passed
- Manual validation steps with outcome
- Contract or schema validation notes

## Change Entry Contract

Every change entry must include:

- change_id
- date
- goal_id
- lignment
- summary
- erification
- decision
"@ | Set-Content -Path 'docs/agents/GOALS_AGENT.md'

  @"
# Change Log

| change_id | date | goal_id | alignment | summary | verification | decision |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-02-18-governance-bootstrap | 2026-02-18 | DOC-BOOTSTRAP-001 | direct | Added AGENTS governance docs, playbook submodule, and validation script. | local doc validation script executed | approved |

## Change Entry Contract

- alignment: direct or partial or 
one
- decision: pproved or evise or locked
"@ | Set-Content -Path 'docs/agents/CHANGE_LOG.md'

  @"
# Release Stages

## Alpha (February 18, 2026 to March 18, 2026)

- WEB-ALPHA-001
- WEB-ALPHA-002
- WEB-ALPHA-003
- DOC-BOOTSTRAP-001

## Beta (March 19, 2026 to April 29, 2026)

- WEB-BETA-001
- WEB-BETA-002
- WEB-BETA-003

## Final (April 30, 2026 to June 10, 2026)

- WEB-FINAL-001
