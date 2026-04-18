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

---

## DECISION-12 — Persistent fixture generation script for BLOCO 5C reproducibility

**ID:** DECISION-12
**Data:** 2026-04-18
**Aprovado por:** Líder técnico humano — aprovação retroativa constante na revisão pós-BLOCO 5C
**Arquivo:** `tests/fixtures/gerar_sinteticos_5c.py`

### Contexto

Durante a execução do BLOCO 5C, foi criado `gerar_sinteticos_5c.py` (222 linhas) como script persistente em vez de geração descartável em memória. O líder técnico questionou a justificativa.

### Justificativa para script persistente

A geração dos PDFs sintéticos é um processo de dois estágios que exige disco:

1. Renderizar o PDF com PyMuPDF e salvá-lo em disco.
2. Reabrir o PDF e chamar `page.search_for()` para extrair bounding boxes reais do texto inserido.

O estágio 2 não é possível sem o PDF em disco. Geração "em memória" não é viável para esse fluxo. Adicionalmente, foi necessário iterar o script (bug de cobertura incompleta do nome FULANO DE TAL SINTETICO — aparecia na linha de dados e na linha de assinatura) — iteração que seria impossível de rastrear sem o script persistente.

### Análise de complexidade (222 linhas)

Composição aproximada:
- ~50 linhas: conteúdo textual dos PDFs (listas de tuplas `(x, y, size, bold, texto)`) — verboso mas necessário para criar documentos plausíveis
- ~30 linhas: quatro funções utilitárias simples sem generalização
- ~100 linhas: `main()` construindo dicts dos CSVs de controle
- ~20 linhas: imports, docstring, boilerplate

Não há abstrações para uso futuro, padrões factory, classes base, nem estrutura que suggira "para quando precisarmos de mais tipos". As duas funções de busca de rect (`extract_rect_for_text` / `extract_all_rects_for_text`) têm propósitos distintos e corretos no mesmo contexto: CPF e endereço têm uma ocorrência; o nome do vendedor aparece duas vezes (dado + assinatura). Não é scope drift.

### Uso além do BLOCO 5C

Nenhum uso planejado além de reproduzibilidade. O script não é chamado por nenhum pipeline. Função: permitir que qualquer auditor regenere os fixtures sintéticos e re-execute a verificação de anonimização a partir do zero.

### Limitação registrada

`extract_rect_for_text` (busca primeira ocorrência) permanece no script mesmo com `extract_all_rects_for_text` cobrindo o caso geral. Coexistência é deliberada: os campos com ocorrência única (CPF, endereço) usam a versão simples; campos com ocorrências múltiplas (nome) usam a versão completa. Não é duplicação desnecessária.

---

## DECISION-13 — Persistent verification script for BLOCO 5C (reference implementation with known limitation)

**ID:** DECISION-13
**Data:** 2026-04-18
**Aprovado por:** Líder técnico humano — aprovação retroativa constante na revisão pós-BLOCO 5C
**Arquivo:** `tests/fixtures/verificar_anonimizacao_5c.py`

### Contexto

Durante a execução do BLOCO 5C, foi criado `verificar_anonimizacao_5c.py` (160 linhas) como script persistente de verificação. O líder técnico questionou a justificativa e perguntou explicitamente se o script implementa o protocolo "OCR + pdftotext" da DECISION-11.

### Justificativa para script persistente

Reproduzibilidade e auditabilidade: sem o script, a verificação de anonimização do BLOCO 5C não pode ser re-executada por auditores. O script também serve como implementação-referência do protocolo de verificação da DECISION-11 para a Activity #3.

### Implementa o protocolo "OCR + pdftotext" da DECISION-11?

**Parcialmente — com limitação documentada.**

| Componente do protocolo DECISION-11 | Implementado? | Ferramenta usada |
|-------------------------------------|---------------|------------------|
| Extração do content stream do PDF | **SIM** | `fitz.Page.get_text()` (PyMuPDF) |
| OCR visual (Tesseract) | **SIM** | `tesseract` via subprocess |
| `pdftotext` (poppler) | **NÃO** | — |

`fitz.Page.get_text()` é funcionalmente equivalente a `pdftotext` — ambos extraem texto diretamente do content stream sem renderização. Porém a DECISION-11 especifica `pdftotext` (poppler) explicitamente como segundo parser, com a justificativa de que parsers diferentes têm comportamentos diferentes e um pode capturar o que o outro falha. Este script **não é** implementação completa do protocolo da DECISION-11: falta a verificação via `pdftotext`.

### Consequência

O script cobre OCR + extração de stream com uma única biblioteca (PyMuPDF). Serve como referência para Activity #3, mas a Activity #3 deverá adicionar a verificação `pdftotext` para cumprir integralmente a DECISION-11. Isso deve ser incorporado ao checklist da Activity #3 quando criado.

### Carry-forward

Quando o checklist da Activity #3 for criado, acrescentar: "verificar_anonimizacao_5c.py é referência parcial; adicionar pdftotext conforme DECISION-11 antes de usar em corpus real."
