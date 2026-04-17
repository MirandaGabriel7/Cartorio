# Command — Start Phase 0

Entry point procedure for the first execution session in the repository. Claude Code runs this sequence before any other activity.

---

## Preconditions

- The repository exists and contains `fase0_plano_execucao.md` at the root.
- The `.claude/` folder is populated.
- The user has approved Phase 0 start.

## Sequence

### 1. Read the source of truth

Read `fase0_plano_execucao.md` in full.

### 2. Read the operating system

In this order:

1. `.claude/CLAUDE.md`
2. `.claude/rules/phase0-scope.md`
3. `.claude/rules/absolute-prohibitions.md`
4. `.claude/rules/human-authority.md`
5. `.claude/rules/sequential-gates.md`
6. `.claude/context/project.md`
7. `.claude/context/glossary.md`
8. `.claude/context/metrics-thresholds.md`
9. `.claude/context/schedule.md`

### 3. Verify environment

Run the setup script:

```
powershell -ExecutionPolicy Bypass -File scripts/setup_ambiente.ps1
```

Expected checks (per Section 2 of the plan):

- Node.js 20 LTS detected.
- Python 3.11.x detected.
- Tesseract 5 detected, with `tessdata_best/por.traineddata` present.
- Poppler `pdftoppm` detected.
- `npm install` successful.
- `pip install -r requirements.txt` successful.
- `npx tsc --noEmit` produces no errors.
- Required directories created.

If any check fails, stop and escalate. Do not attempt alternative installation paths.

### 4. Initialize the execution log

If `relatorios/log_execucao.md` does not exist yet, create it with this header:

```markdown
# Log de Execução — Fase 0

Projeto: CartórioDoc
Plano: fase0_plano_execucao.md v1.0
```

Append the initial entry using `templates/activity-log-entry.md`:

```markdown
## [YYYY-MM-DD HH:MM] Activity: Setup do ambiente

**Status:** CONCLUDED
**Duration:** <X hours>
**Summary:** Environment verified per setup_ambiente.ps1. All tools detected.
**Parameters declared:** node=<version>, python=<version>, tesseract=<version>, poppler=<version>
**Outputs:** n/a (environment setup)
**Issues encountered:** None
**Next activity:** Coleta do corpus (145 documentos)
```

### 5. State the current position

Respond to the user with:

- Which activity is next per `context/schedule.md`.
- Which gate is currently open.
- Which rules apply to the next activity.
- Which checklist / playbook will be used.

### 6. Stand by

Do not start the next activity (corpus collection) automatically. Corpus collection depends on human annotators and cartório-alvo delivery. Wait for explicit user instruction that anonymized documents are available in `corpus/anonimizados/`.

## Resumption in later sessions

When resuming an existing Phase 0 session, skip the setup and read:

1. The last 200 lines of `relatorios/log_execucao.md`.
2. Any recent file under `decisoes/`.
3. The current gate's status file (`gates/gate-<N>.md`).

Then identify:

- Which activity was last logged.
- What status it had.
- Which gate (if any) is awaiting approval.
- Which activity is next.

Proceed only after stating the current position to the user and receiving confirmation.

## Hard rules

- Do not start any benchmark without environment verification passing.
- Do not skip reading the source-of-truth document because "I remember it".
- Do not start an activity before logging its start entry.