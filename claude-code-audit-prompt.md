# Claude Code — Full Operationalization Audit

> **Mode:** Read this file completely before acting. Do not skip sections.
> **Execution:** Phase 1 must use subagents. Do not run Phase 4 before completing Phase 3 and presenting the plan.

---

## Objective

Audit, design, and implement advanced Claude Code best practices in this repository.
Focus: quality, speed, context efficiency, maintainability, and real daily usability.

Do not guess. Do not add random Claude files. Everything must be justified by the project's real structure, real workflows, and real usage patterns.

---

## Core Principles (Non-Negotiable)

- Start with subagents for investigation — never investigate directly in main context
- Keep the main context clean throughout execution
- Prefer concise, high-signal project instructions
- Optimize for real usage, not theory
- Favor maintainability over overengineering
- Do not rewrite unrelated project code
- Do not touch business logic unless strictly necessary for Claude Code integration quality
- Be conservative where structure is good, aggressive where it is clearly missing or poor

---

## Phase 1 — Investigation (Subagents Required)

**Use subagents in parallel** to investigate the following. Do not read files directly in main context.

### Subagent A — Claude Code Setup Scanner
```
Read-only. Scan and summarize:
- Does CLAUDE.md exist? How many lines? Is it lean or bloated?
- Does .claude/ directory exist? What is inside?
- Are there .claude/agents/, .claude/skills/, .claude/commands/?
- Does .claude/settings.json exist? Does it have hooks?
- Are there any MCP configurations (.mcp.json or similar)?
Report findings as a structured list. Do not read project source code.
```

### Subagent B — Repository Structure Scanner
```
Read-only. Scan and summarize:
- What is the tech stack? (language, framework, runtime)
- What are the top-level directories and their purpose?
- Are there test files? Where? What test runner?
- Is there a CI/CD configuration?
- What are the main entry points?
- How large is the codebase approximately (file count)?
Report findings as a structured list. Do not go deeper than 2 levels unless necessary.
```

### Subagent C — Workflow and Pain Point Analyst
```
Read-only. Based on repository structure (src/, tests/, config files), identify:
- What recurring developer workflows exist? (build, test, lint, deploy, migrate)
- What commands are likely run frequently?
- Are there large test output risks (verbose test runners)?
- Are there areas of the codebase that are complex enough to need documented investigation?
- What would a developer need to understand before touching each main module?
Report as: [workflow] → [frequency] → [context risk]
```

Wait for all three subagents to complete. Consolidate findings before proceeding.

---

## Phase 2 — Gap Analysis

Based on Phase 1 findings, evaluate each area:

### 2.1 CLAUDE.md
- Does it exist?
- Line count: is it under 200 lines? (target: under 200, ideally 80–120)
- Is every line in it actually preventing errors or improving execution?
- Is there content that belongs in a skill or a separate file instead?
- Is there a compact instruction section?
- Grade: Good / Weak / Missing

### 2.2 .claude/agents/
Evaluate whether the project would benefit from:
- **Haiku-based read-only codebase explorer** — for file scanning without context cost
- **Test output investigator** — if the project has verbose test runners
- **Schema/migration investigator** — if the project has a database layer
- **UI/browser testing agent** — if the project has frontend flows
Only propose agents that match real project needs found in Phase 1.

### 2.3 .claude/skills/
Evaluate whether any of the following would be genuinely useful:
- Architecture overview skill (loaded on demand, not on startup)
- Domain rules skill (business rules, field validations, gotchas)
- Deployment workflow skill
- Testing strategy skill
Only propose skills for content that currently pollutes CLAUDE.md or is completely absent.

### 2.4 .claude/commands/
Evaluate whether recurring workflows in this project would benefit from saved commands:
- `start-investigation` — run subagents before implementing anything
- `plan-implementation` — structured planning before coding
- `review-diff` — review changes before commit
- `validate-release` — pre-release checks
- `analyze-failing-tests` — structured test failure diagnosis
Only propose commands that match real recurring workflows found in Phase 1.

### 2.5 Hooks / .claude/settings.json
- Does the project have verbose test output? → hook to filter test results
- Does the project have large log output from common commands? → hook to reduce noise
Only add hooks where context waste is real and measurable.

### 2.6 MCP Configuration
- Are MCPs configured globally when they should be scoped to specific subagents?
- Are there MCPs that are only occasionally needed?
- Are there obvious MCP integrations missing that would clearly help real workflows?
Do not add speculative MCP complexity.

---

## Phase 3 — Implementation Plan

Before touching any file, present a structured plan:

```
CREATE:
- [file path] — [one-line reason]

UPDATE:
- [file path] — [what changes and why]

REMOVE:
- [file path] — [why it should be removed]

LEAVE AS-IS:
- [file path] — [why it is already correct]
```

**Do not proceed to Phase 4 until this plan is presented.**
If running autonomously: present the plan as a comment block, then proceed.

---

## Phase 4 — Implementation

Apply all approved changes from Phase 3.

### CLAUDE.md Requirements
If creating or rewriting:
- Maximum 200 lines (target: 80–120)
- Must include: build commands, test commands, critical code rules, gotchas
- Must include a `## Compact Instructions` section at the bottom
- Must NOT include: architecture explanations, API documentation, module descriptions, anything that belongs in a skill
- Every line must answer: "Does removing this cause Claude to make errors?"

Example compact section:
```markdown
## Compact Instructions
When compacting, always preserve:
- Final implementation decisions (not explorations)
- Exact field names, types, and interfaces modified
- Test cases written or changed
- Any commands or flags discovered during the session
Discard: investigation steps, planning discussions, failed attempts, exploration output
```

### Agent Requirements
Each agent file at `.claude/agents/[name].md` must have:
```markdown
---
name: [name]
description: [precise trigger description — when should Claude invoke this agent?]
model: [claude-haiku-4-5 for read-only/scanning, claude-sonnet-4-5 for reasoning]
tools: [minimal tool set for the agent's actual purpose]
---

[Clear instructions. What the agent does. What it must NOT do. Output format.]
```

### Skill Requirements
Each skill file at `.claude/skills/[name]/SKILL.md` must have:
```markdown
---
name: [name]
description: [when to load this skill — specific trigger scenarios]
---

[The actual content. No filler. No repetition of CLAUDE.md.]
```

### Command Requirements
Each command at `.claude/commands/[name].md` must:
- Describe a real recurring workflow
- Use subagents where investigation is needed
- Be concise — a command is a workflow, not a document

---

## Phase 5 — Validation

After implementation, verify:

**Consistency checks:**
- [ ] CLAUDE.md is under 200 lines
- [ ] CLAUDE.md does not repeat content from any skill
- [ ] No two agents have overlapping purposes
- [ ] No two skills cover the same domain
- [ ] All commands reference real recurring workflows
- [ ] Hooks only exist where context waste is measurable

**Quality checks:**
- [ ] Every file has a clear, distinct purpose
- [ ] Nothing was added speculatively
- [ ] The setup would survive a new developer joining the project
- [ ] Running `/project:start-investigation` (if created) would work correctly

**Report format:**
```
CREATED: [list of files created]
UPDATED: [list of files updated]
REMOVED: [list of files removed]
LEFT AS-IS: [list of files intentionally unchanged]
VALIDATION: [pass/fail per check above]
REMAINING LIMITATIONS: [honest list of what is still weak]
```

---

## Reference: Advanced Claude Code Patterns

Use these patterns as implementation guidance (do not explain them back — just apply):

**Context isolation:** Expensive investigation goes in subagents, not main context.

**CLAUDE.md discipline:** Under 200 lines. Only what prevents errors. Architecture docs go in skills.

**Haiku for scanning:** Use `claude-haiku-4-5` for read-only file exploration agents. Fast and cheap.

**Focused /compact:** Add compact instructions to CLAUDE.md so Claude knows what to preserve when compressing context.

**Scoped MCPs:** If an MCP is only needed for specific tasks, put it in the agent that uses it, not globally.

**Parallel subagents:** When investigating multiple unrelated modules, use parallel subagents. Faster, cleaner.

**On-demand skills:** Architecture docs, domain rules, and deployment workflows load as skills — not on startup.

**Hook discipline:** Hooks for test output filtering are only worth it if the test runner is genuinely verbose. Measure before adding.

---

## Execution Start

Begin with Phase 1. Use parallel subagents for investigation.
Do not read files in main context during investigation.
Consolidate findings, present gap analysis, present plan, then implement.