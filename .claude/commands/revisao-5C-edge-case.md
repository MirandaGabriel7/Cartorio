BLOCO 5C APROVADO.



A descoberta do bug de anonimização é significativa — o script do plano v1.3 Seção 3.2.2 só cobria visualmente o texto, deixando o content stream intacto. Isso é vazamento de PII em potencial em produção. A correção para add\_redact\_annot + apply\_redactions está certa. DECISION-10 registrada corretamente.



DOIS REGISTROS OBRIGATÓRIOS ANTES DE 5D:



REGISTRO 1 — Marcar DECISION-10 para o relatório final da Fase 0



Adicione ao arquivo decisoes/decisao\_anonimizacao\_redacao.md uma seção final "Carry-forward to final report" com o seguinte texto:



"Esta decisão deve aparecer textualmente na seção 'Deviations from plan v1.3' ou equivalente do relatorios/relatorio\_final\_fase0.md quando for escrito na Atividade #13. Razão: a correção do script de anonimização é divergência do plano v1.3 Seção 3.2.2, aprovada retroativamente pelo líder técnico, e tem impacto direto em segurança de PII. Auditor precisa ver isso explicitamente."



REGISTRO 2 — Fortalecer checklist da Atividade #3 (Anonimização do corpus)



A Seção 3.2.3 do plano especifica que o segundo anotador verifica a anonimização via OCR. Dada a descoberta deste bloco, OCR sozinho é insuficiente — ele verifica só o que está visualmente impresso, não o que está no content stream do PDF.



Adicione um technical-decision-record em decisoes/decisao\_anonimizacao\_redacao.md:



Título: "Reinforced verification protocol for corpus anonymization (Activity #3)"



Context: DECISION-10 corrigiu o script de anonimização para usar redação real (add\_redact\_annot + apply\_redactions) em vez de cobertura visual. A Seção 3.2.3 do plano especifica verificação pelo segundo anotador via OCR. OCR verifica apenas texto visualmente presente; pode perder texto remanescente no content stream se redação falhar parcialmente em algum documento.



Alternatives considered:

(1) Manter protocolo original (só OCR) — risco residual se script falhar parcialmente

(2) Adicionar verificação via pdftotext (extrai content stream direto) — detecta qualquer texto remanescente independente de visibilidade

(3) Adicionar ambos



Decision taken: (3) — OCR + pdftotext. OCR detecta visual overlays mal feitos; pdftotext detecta falhas de redação no content stream. Verificações complementares.



Justification: O Bloco 5C demonstrou empiricamente que o bug original passaria por OCR (não visível na imagem rasterizada) mas seria detectado por pdftotext (extrai do stream direto). Para corpus real com PII, ambas as verificações são necessárias.



Impact: Adiciona \~30 segundos por documento ao processo de verificação. Para 145 documentos: \~1 hora adicional total. Aceitável.



Implementation note: O segundo anotador deve rodar AMBAS verificações:

\- OCR (conforme plano v1.3 Seção 3.2.3)

\- pdftotext (novo): comando `pdftotext <anonimizado.pdf> -` e grep por padrões sensíveis (CPF de 11 dígitos que não sejam placeholder, nomes da lista original se disponível)



Approved by: líder técnico humano — esta mensagem constitui aprovação retroativa



Evidence: Bloco 5C em relatorios/log\_execucao.md + decisoes/decisao\_anonimizacao\_redacao.md DECISION-10



Related to: Activity #3 (Anonimização do corpus), Activity #2 quality control



Carry-forward: Este protocolo reforçado deve ser aplicado quando Activity #3 for executada. O script/checklist da Activity #3 deve incorporar essa verificação dupla. Registrar no checklist auxiliar quando criado.



\---



APÓS OS DOIS REGISTROS:



1\. Commit dedicado: "docs: register carry-forwards from BLOCO 5C discovery (anonymization bug and reinforced verification protocol)"

2\. Reporte os diffs (arquivos modificados + linhas adicionadas)

3\. PARE



Depois disso, autorizarei o BLOCO 5D — sanity check de rasterização.

