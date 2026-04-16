# Template — Decision: Rasterization Library

Copy this template to `decisoes/decisao_rasterizacao.md`. Fill every field. Do not add sections. Do not reorder. Keep the signature line blank for the technical lead.

---

```markdown
# Decision: Primary Rasterization Library

**Date drafted:** <YYYY-MM-DD>
**Drafted by:** Claude Code
**Library chosen:** <mupdf | poppler>
**Alternative:** <poppler | mupdf>
**Preprocessing profile paired with this decision:** <EXPERIMENT_X>

---

## 1. Context

<Why this decision was needed. 2–3 sentences citing Section 4 of the plan.>

## 2. Evaluation protocol

- Sample: 20 documents per quotas ESC-BOA=5, ESC-DEG=5, MAT-ATUAL-BOA=5, MAT-MONO=3, ESC-MARCA=2.
- DPIs tested: 300 and 400.
- Page rasterized per document: 0.
- Execution environment: Node <version>, mupdf <version>, Poppler <pdftoppm version>, Windows <version>.
- Source artifact: `benchmarks/rasterizacao/resultados_rasterizacao.json`.

## 3. Metrics

| Metric                                         | mupdf  | poppler |
| ---------------------------------------------- | ------ | ------- |
| Mean time per page at 300 DPI (ms)             | <x>    | <y>     |
| Mean time per page at 400 DPI (ms)             | <x>    | <y>     |
| Mean output size at 300 DPI (KB)               | <x>    | <y>     |
| Mean output size at 400 DPI (KB)               | <x>    | <y>     |
| Error rate                                     | <x>%   | <y>%    |
| Effective resolution conformance               | <x>/20 | <y>/20  |
| Visual inspection: sharper text (sample of 10) | <x>/10 | <y>/10  |

## 4. Gate 1 rasterization sub-criteria verification

| #   | Condition                                                  | Result   | Met       |
| --- | ---------------------------------------------------------- | -------- | --------- |
| 1   | Chosen primary error rate = 0% in 20-doc sample            | <result> | <SIM/NÃO> |
| 2   | Chosen primary mean time ≤ 1.5 × alternative mean time     | <result> | <SIM/NÃO> |
| 3   | Chosen primary sharper text in ≥ 18 of 20 documents        | <result> | <SIM/NÃO> |
| 4   | Effective resolution matches requested DPI in 100% of runs | <result> | <SIM/NÃO> |

## 5. Preprocessing benchmark summary

- Winning experiment ID: <EXPERIMENT_X>
- Parameters: <full list from playbooks/preprocessing-benchmark.md>
- Mean CER reduction vs. Experiment A: <X%>
- Watermark filtering rate on watermarked pages: <X%>
- Legitimate text loss cases: <count> (target: 0)

## 6. Justification

<Paragraph explaining why the chosen library is primary given the evidence. Cite specific rows of the metrics table. No marketing language.>

## 7. Exceptions documented

<"None" | precise list of exceptions with justification per exception>

## 8. Documents excluded from the benchmark (if any)

| documento_id | Reason for exclusion | Approved by      |
| ------------ | -------------------- | ---------------- |
| <id>         | <reason>             | <technical lead> |

<Or "None.">

## 9. Impact on the Phase 0 pipeline

- Rasterization library locked to <chosen> at 300 DPI.
- Preprocessing profile locked to <EXPERIMENT_X>.
- Downstream benchmarks (OCR, parser sketch) must use this rasterization + preprocessing pair.

## 10. Source artifacts

- `benchmarks/rasterizacao/resultados_rasterizacao.json`
- `benchmarks/preprocessamento/preprocessamento_resultados.json`
- `relatorios/log_execucao.md` (activity entries from <date range>)

---

## Technical lead approval

_This section is completed by the technical lead only. Claude Code must not prefill._

**Approved by:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Signature:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Comments:** **\*\*\*\***\_\_\_\_**\*\*\*\***
```
