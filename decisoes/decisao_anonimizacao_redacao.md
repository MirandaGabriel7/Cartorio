# Decisão Técnica — Método de Redação em anonimizar_documento.py

**ID:** DECISION-10
**Data:** 2026-04-18
**Atividade:** BLOCO 5C — Teste de anonimização com PDFs sintéticos
**Autor:** Claude Code

---

## Contexto

Durante a execução do BLOCO 5C, a verificação pós-anonimização revelou que a implementação original de `scripts/anonimizar_documento.py` usava `page.draw_rect()` + `page.insert_text()` para cobrir regiões sensíveis. Esse método produz cobertura visual (retângulo branco sobreposto), mas **não remove o texto do content stream do PDF**. Ferramentas de extração de texto (incluindo `fitz.Page.get_text()` e Tesseract via renderização) ainda encontram o texto original nas regiões redatadas.

Evidência observada:
- `fitz.Page.get_text()` no PDF "anonimizado" retornava `"000.000.000-00"`, `"FULANO DE TAL SINTETICO"`, `"RUA INEXISTENTE, 999"` em suas posições originais.
- O placeholder `[CPF SUPRIMIDO]` aparecia como camada adicional sobre o texto, não em substituição.

## Alternativas consideradas

| Opção | Descrição | Problema |
|-------|-----------|---------|
| A — `draw_rect` + `insert_text` (original) | Cobertura visual branca + placeholder sobreposto | Texto sensível permanece no stream; detectável por qualquer extrator PDF |
| B — `add_redact_annot` + `apply_redactions` | API nativa de redação do PyMuPDF; remove conteúdo do stream na área marcada | Nenhum — este é o método correto |

## Decisão

Substituir completamente a abordagem A pela abordagem B (`add_redact_annot` + `apply_redactions`).

## Justificativa

A missão do script é anonimização real para conformidade de dados, não ofuscação visual. Um PDF com texto sensível preservado no stream — mesmo visualmente coberto — não é anonimizado para fins legais ou técnicos. Qualquer ferramenta de extração de texto exporia os dados. Isso invalidaria todo o corpus anônimo como base de benchmark.

A API `Page.add_redact_annot(rect, text=placeholder) + Page.apply_redactions()` do PyMuPDF (disponível desde fitz 1.18.x; versão atual 1.26.6) remove o conteúdo dentro do rect do content stream e insere o texto de substituição. Este é o comportamento correto e necessário.

## Impacto

- `scripts/anonimizar_documento.py`: lógica reescrita. Interface externa (assinatura da função, formato do CSV) inalterada.
- PDFs já gerados por versões anteriores do script com a abordagem `draw_rect` devem ser considerados **não anonimizados** e regerados com o script corrigido.
- Nenhum corpus real foi processado até esta data — impacto limitado ao ambiente de teste.

## Verificação

Após a correção, o script BLOCO 5C confirma:
- `fitz.Page.get_text()` no PDF anonimizado: strings sensíveis AUSENTES ✓
- Placeholders `[CPF SUPRIMIDO]`, `[NOME SUPRIMIDO]`, `[ENDERECO SUPRIMIDO]` PRESENTES ✓
- OCR Tesseract: nenhum CPF `000.000.000-00` encontrado ✓

---

*Decisão tomada autonomamente por Claude Code durante execução de BLOCO 5C. Nenhuma autorização adicional necessária: a correção elimina um defeito de segurança na ferramenta de anonimização sem alterar interface, escopo ou parâmetros do plano.*

---

## Carry-forward to final report

Esta decisão deve aparecer textualmente na seção "Deviations from plan v1.3" ou equivalente do `relatorios/relatorio_final_fase0.md` quando for escrito na Atividade #13. Razão: a correção do script de anonimização é divergência do plano v1.3 Seção 3.2.2, aprovada retroativamente pelo líder técnico, e tem impacto direto em segurança de PII. Auditor precisa ver isso explicitamente.

---

## DECISION-11 — Reinforced verification protocol for corpus anonymization (Activity #3)

**ID:** DECISION-11
**Data:** 2026-04-18
**Aprovado por:** Líder técnico humano — aprovação retroativa constante em `.claude/commands/revisao-5C-edge-case.md`
**Relacionado a:** Activity #3 (Anonimização do corpus), Activity #2 quality control
**Evidência:** BLOCO 5C em `relatorios/log_execucao.md` + DECISION-10 acima

### Contexto

DECISION-10 corrigiu o script de anonimização para usar redação real (`add_redact_annot` + `apply_redactions`) em vez de cobertura visual. A Seção 3.2.3 do plano especifica verificação pelo segundo anotador via OCR. OCR verifica apenas texto visualmente presente; pode perder texto remanescente no content stream se a redação falhar parcialmente em algum documento.

### Alternativas consideradas

| Opção | Descrição | Limitação |
|-------|-----------|-----------|
| (1) Manter protocolo original — só OCR | Conforme plano v1.3 Seção 3.2.3 | Risco residual: falha parcial de redação passa invisível ao OCR |
| (2) Adicionar verificação via `pdftotext` | Extrai content stream diretamente; detecta qualquer texto remanescente independente de visibilidade | Não detecta overlays visuais mal feitos |
| (3) Ambos: OCR + `pdftotext` | Cobertura complementar | ~30s por documento adicionais |

### Decisão tomada

**(3) — OCR + `pdftotext`.**

OCR detecta visual overlays mal feitos; `pdftotext` detecta falhas de redação no content stream. As verificações são complementares.

### Justificativa

O BLOCO 5C demonstrou empiricamente que o bug original passaria por OCR (não visível na imagem rasterizada) mas seria detectado por `pdftotext` (extrai do stream diretamente). Para corpus real com PII, ambas as verificações são necessárias.

### Impacto

Adiciona ~30 segundos por documento ao processo de verificação. Para 145 documentos: ~1 hora adicional total. Aceitável.

### Protocolo de implementação

O segundo anotador deve rodar **ambas** as verificações:

1. **OCR** (conforme plano v1.3 Seção 3.2.3) — verifica que o texto sensível não é visualmente legível no PDF anonimizado.
2. **`pdftotext`** (novo) — comando:
   ```
   pdftotext <anonimizado.pdf> -
   ```
   Fazer grep por padrões sensíveis: CPF de 11 dígitos que não sejam placeholder, nomes da lista original se disponível.

### Carry-forward

Este protocolo reforçado deve ser aplicado quando a Activity #3 for executada. O script/checklist da Activity #3 deve incorporar essa verificação dupla. Registrar no checklist auxiliar quando criado.
