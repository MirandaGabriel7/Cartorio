# .claude — Operating System for CartórioDoc Phase 0

This folder is the operating system that governs how Claude Code executes **Phase 0 — Document and Pipeline Validation** of the CartórioDoc project. Every file here exists to make execution traceable, disciplined, and auditable. Nothing here is decorative.

---

## Purpose

Phase 0 is the risk-elimination phase of the project. It produces three data-validated technical decisions — rasterization library, OCR engine, parser feasibility — and a frozen regression baseline. The `.claude` folder makes sure those decisions are produced under rigorous, repeatable, human-gated conditions.

## Source of truth

The file `fase0_plano_execucao.md` at the repository root is the authoritative document. Every file inside `.claude` is derived from it and subordinate to it. If any file in `.claude` contradicts the plan, the plan wins and the `.claude` file must be corrected.

## Folder map

| Folder        | What it contains                                 | When to consult                                   |
| ------------- | ------------------------------------------------ | ------------------------------------------------- |
| `rules/`      | Non-negotiable operational rules                 | Before every action                               |
| `playbooks/`  | Step-by-step procedures per activity             | Before starting any activity                      |
| `checklists/` | Completion verification lists                    | Before signaling that an activity or gate is done |
| `templates/`  | Exact format for every Markdown artifact         | Before writing any report, decision, or log entry |
| `schemas/`    | Schema reference for every JSON artifact         | Before writing any JSON output                    |
| `agents/`     | Role definitions for specialized execution modes | When selecting how to approach a task             |
| `commands/`   | Named procedures for recurring operations        | When executing a standard operation               |
| `context/`    | Project context, glossary, thresholds, schedule  | For quick lookup of facts and numbers             |
| `gates/`      | Exact gate conditions and approval protocol      | Before signaling a gate for human approval        |

## Entry point

Read `CLAUDE.md` first, then `commands/start-phase0.md`. Do nothing before those two files have been read.

## Hard rules summary

- No production code.
- No generative AI for document processing.
- No internet during benchmarks.
- No gate approval by Claude.
- No phase closure by Claude.
- No corpus exclusion without written justification.
- No ground truth modification to match pipeline output.

Full list in `rules/absolute-prohibitions.md`.

## How this folder evolves

The `.claude` folder is frozen for the duration of Phase 0 execution. Any change requires explicit approval from the technical lead and must be recorded in the execution log (`relatorios/log_execucao.md`). Undocumented changes are treated as scope drift.


