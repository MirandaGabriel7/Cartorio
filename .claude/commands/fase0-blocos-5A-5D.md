Trate esta mensagem como a instrução canônica para as atividades preparatórias — não volte a consultar mensagens anteriores sobre este Item 5.

AUTORIZAÇÃO FORMAL — ATIVIDADES PREPARATÓRIAS ENQUANTO AGUARDAMOS O CORPUS

Estas atividades são autorizadas pela Seção 9 do plano como preparatórias (não avançam gates, não substituem a Atividade #2). Cada uma tem entregável claro e PARE ao final de cada bloco para eu revisar antes de seguir ao próximo.

REGRA DE OURO continua aplicável em TODAS: qualquer decisão não coberta textualmente pelo plano ou por esta mensagem exige technical-decision-record antes da aplicação.

---

BLOCO 5A — Schemas JSON executáveis

Converter os 8 schemas documentados em .claude/schemas/*.md em schemas JSON consumíveis por ajv.

Entregáveis:
- scripts/schemas/corpus-catalog.schema.json
- scripts/schemas/ground-truth.schema.json
- scripts/schemas/rasterization-results.schema.json
- scripts/schemas/preprocessing-results.schema.json
- scripts/schemas/ocr-benchmark-report.schema.json
- scripts/schemas/anchors-catalog.schema.json
- scripts/schemas/parser-sketch-results.schema.json
- scripts/schemas/baseline-v1.schema.json

Especificações:
- Cada schema reflete fielmente o contrato em .claude/schemas/*.md correspondente.
- Use JSON Schema draft-07 (menos restrito, ajv por padrão; se quiser draft-2020-12 registre decisão técnica primeiro).
- Campos marcados "required" no .md devem aparecer em "required" do JSON Schema.
- Tipos explícitos.
- "additionalProperties": false no nível raiz de cada schema (documentos em produção não devem ter campos fantasma).
- Exceção: "additionalProperties": true em objetos tipo "campos" do ground-truth onde o plano permite extensão por nome de campo dinâmico (ex: transmitente_N_nome, onus_N_tipo). Registre em cada schema quais sub-objetos têm additionalProperties relaxado e por quê, em comentário dentro do próprio schema JSON se possível, ou em technical-decision-record se não for.
- Regex para campos como CPF (11 dígitos) devem estar em "pattern".
- Datas ISO 8601: "format": "date" ou "format": "date-time".

Decisões autônomas permitidas dentro deste bloco:
- Escolher entre draft-07 (default) ou draft-2020-12 (se fizer, registre)
- Estrutura interna do arquivo JSON Schema (ordem de propriedades, uso de $defs/definitions)
- Comentários dentro do JSON Schema via $comment

Decisões que EXIGEM technical-decision-record antes:
- Qualquer desvio entre o JSON Schema gerado e o contrato documentado em .claude/schemas/*.md
- Qualquer campo que você considera que deveria ser required mas o .md diz opcional (ou vice-versa)
- Introdução de $ref cruzado entre schemas

Após concluir 5A: rodar ajv validate em cada schema contra si mesmo (metaschema check) e reportar. PARE.

---

BLOCO 5B — Validadores

Implementar lógica completa (não skeleton) de:
- scripts/validar_corpus_catalog.ts
- scripts/validar_ground_truth.ts

Especificações scripts/validar_corpus_catalog.ts:
- Carrega corpus/corpus_catalog.json
- Valida contra scripts/schemas/corpus-catalog.schema.json via ajv
- Valida invariantes adicionais listadas em .claude/schemas/corpus-catalog.md (unicidade de documento_id, consistência tipo_documento ↔ documento_id, existência dos arquivos PDF referenciados em arquivo/ground_truth_arquivo, quotas por categoria conforme Seção 3.1 do plano, regras cruzadas tipo_documento vs campos, etc.)
- Ground truth files são validados pelo outro script — aqui só verifica que se ground_truth_disponivel=true, o arquivo apontado existe
- Exit code 0 se válido, 1 se inválido
- Saída stdout: sumário legível (N documentos válidos, M erros, lista de erros com documento_id e descrição)
- Saída JSON: relatorios/validacao_corpus.json com estrutura { data, total_documentos, total_validos, total_erros, erros: [{documento_id, campo, regra, mensagem}] }

Especificações scripts/validar_ground_truth.ts:
- Carrega todos os arquivos corpus/ground_truth/*_gt.json
- Cada um valida contra scripts/schemas/ground-truth.schema.json
- Valida invariantes adicionais listadas em .claude/schemas/ground-truth.md:
  * CPF length = 11 dígitos (já no pattern, mas verificar semantica: não pode ser só zeros)
  * CNPJ length = 14 dígitos
  * Datas em ISO 8601
  * Valores monetários como integer cents
  * documento_id cruzado com corpus_catalog.json
  * 34 checklist items presentes
  * Se discordancias_resolvidas=true, resolucao_discordancias deve ser não-null
  * Para calibration corpus (ler do catalog qual é calibração): anotador_secundario não-null e discordancias_resolvidas=true
- Saída JSON: relatorios/validacao_ground_truth.json

Testes obrigatórios:
- Crie tests/fixtures/corpus_catalog_valido_sintetico.json (2-3 documentos fictícios — use padrões claramente inválidos como CPFs 000.000.000-00, nomes "FULANO SINTETICO 001")
- Crie tests/fixtures/corpus_catalog_invalido_sintetico.json (mesmos documentos com erros deliberados: documento_id duplicado, CPF de 10 dígitos, tipo_documento inconsistente)
- Crie equivalentes para ground truth (1-2 arquivos _gt.json sintéticos, válido e inválido)
- Rode os validadores contra ambos e confirme: válido retorna exit 0, inválido retorna exit 1 com descrição correta dos erros

Não commite os fixtures se eles contiverem qualquer coisa que lembre dado real. Se forem claramente fictícios (FULANO SINTETICO, CPF 000...), pode commitar.

Após concluir 5B: rodar ambos validadores contra ambos fixtures e colar a saída no log. PARE.

---

BLOCO 5C — Teste da anonimização com PDFs sintéticos

Entregável: demonstrar que scripts/anonimizar_documento.py funciona corretamente em PDFs gerados por você.

Especificações:
- Gere 2 PDFs fictícios usando PyMuPDF (fitz):
  * tests/fixtures/sintetico_escritura_001.pdf — texto plausível de escritura MAS totalmente inventado; contenha pelo menos um "CPF" com padrão 000.000.000-00, um nome "FULANO DE TAL SINTETICO", um endereço fictício "RUA INEXISTENTE, 999"
  * tests/fixtures/sintetico_matricula_001.pdf — similar, formato de matrícula
- Gere CSVs de controle correspondentes (tests/fixtures/sintetico_escritura_001_controle.csv, etc.) com as coordenadas aproximadas dos campos a anonimizar
- Rode: python scripts/anonimizar_documento.py <pdf> <csv> <saida.pdf>
- Verifique o resultado:
  * Abrir o PDF de saída (use PyMuPDF para extrair texto)
  * Confirmar que o texto original nas regiões marcadas NÃO aparece mais
  * Confirmar que o placeholder definido no CSV APARECE na posição correta
  * Rodar OCR Tesseract no PDF anonimizado e verificar que não há CPFs de 11 dígitos não-placeholder

NÃO use dados reais. Se usar, pare imediatamente e reconheça violação.

Após concluir 5C: reportar no log:
- PDFs gerados
- Resultado da verificação (texto original ausente: SIM/NAO, placeholder presente: SIM/NAO, OCR scan encontrou CPF não-placeholder: SIM/NAO)
PARE.

---

BLOCO 5D — Sanity check de rasterização

Entregável: demonstrar que mupdf e poppler rasterizam PDFs em 300 DPI no Windows com o ambiente atual.

Especificações:
- Use sintetico_escritura_001.pdf criado no 5C
- Rasterize a página 0 com mupdf (usando a API do pacote npm mupdf) → salve como temp/sanity_mupdf_300.png
- Rasterize a mesma página com pdftoppm → salve como temp/sanity_poppler_300.png
- Reporte:
  * Dimensões (largura × altura em pixels)
  * Tamanho do arquivo
  * Tempo aproximado de cada chamada
- Exclua ambos PNGs após o teste (temp/ é gitignored, mas melhor limpar)

DEIXE CLARO no log que isto NÃO é o benchmark de rasterização oficial da Atividade #6. É apenas validação de ambiente. O benchmark oficial:
- Usa corpus real (não PDFs sintéticos)
- Usa 20 documentos específicos
- Compara em 2 DPIs (300 e 400)
- Gera benchmarks/rasterizacao/resultados_rasterizacao.json validado por schema
- Alimenta o Gate 1

Registre no log como "SANITY CHECK — rasterization environment validation (NOT the official benchmark of Activity #6)".

Após concluir 5D: reportar métricas no log. PARE.

---

ORDEM DE EXECUÇÃO:

1. Execute BLOCO 5A. Pare. Me reporte.
2. Eu reviso e autorizo 5B.
3. Execute BLOCO 5B. Pare. Me reporte.
4. Eu reviso e autorizo 5C.
5. Execute BLOCO 5C. Pare. Me reporte.
6. Eu reviso e autorizo 5D.
7. Execute BLOCO 5D. Pare. Me reporte.

Não pule nenhum PARE. Não execute o próximo bloco sem minha autorização explícita, mesmo que você esteja confiante.

Limite de tempo total para os 4 blocos: 2-3 dias de trabalho. Se algum bloco está consumindo mais tempo do que parece razoável (ex: 5A passa de 4 horas), pare e me avise antes de continuar.

Regra de Ouro continua aplicável em cada bloco.

Comece com 5A.