Relatório do 5B recebido. Cobertura dos invariantes está boa, testes básicos passaram. Uma verificação obrigatória antes de autorizar 5C — e uma correção de higiene opcional.



VERIFICAÇÃO OBRIGATÓRIA — edge case tipo×qualidade



No Bloco 5B da instrução em .claude/commands/fase0-blocos-5A-5D.md, especifiquei:



"Validação de combinações semânticas tipo×qualidade — AQUI é onde você resolve o edge case escritura\_mono\_001 documentado em DECISION-5A-1. O regex do schema aceita; o validador rejeita. Liste as combinações VÁLIDAS explicitamente no código e rejeite qualquer combinação não listada."



Seu relatório lista "Check 6: tipo\_documento ↔ documento\_id prefix consistency" mas não é claro se isso implementa a validação tipo×qualidade (ex: escritura\_mono\_001 deve ser rejeitado porque "mono" não é qualidade válida para escritura).



Responda:



(a) O Check 6 atual apenas valida o prefix (escritura\_\* ↔ ESCRITURA, matricula\_\* ↔ MATRICULA)? Ou também valida a qualidade contra a lista de qualidades permitidas para cada tipo?



(b) Se só valida prefix, escritura\_mono\_001 passa nos validadores atuais? Teste empiricamente: crie um fixture mínimo com documento\_id "escritura\_mono\_001" e tipo\_documento "ESCRITURA\_COMPRA\_VENDA", rode o validador, cole a saída. Se o validador aprovar, está errado — precisa corrigir.



(c) Se precisa corrigir, a lista de combinações válidas deve vir da Seção 3.1 do plano. Mapeamento derivado:



ESCRITURA\_COMPRA\_VENDA aceita qualidades: boa, degradada, baixa, nativa, multi, pj, rogo, marca, prenot

MATRICULA aceita qualidades: boa, degradada, mono, onus, rural, transporte



(Derivado assim: categorias ESC-\* da Seção 3.1 → suas qualidades; categorias MAT-\* → suas qualidades. Nota: "boa" e "degradada" aparecem em ambos como qualidades genéricas. "baixa" só aparece em ESC-BAIXA. "nativa" só em ESC-NATIVA. "mono/onus/rural/transporte" só em matrículas. "multi/pj/rogo/marca/prenot" só em escrituras.)



Confira esse mapeamento contra a Seção 3.1 do plano antes de implementar. Se discordar de alguma entrada, registre em technical-decision-record e me explique.



Adicione ao validar\_corpus\_catalog.ts um novo check (pode ser numerado Check 10 ou integrado ao Check 6) que:

\- Extrai a "qualidade" do documento\_id (segundo segmento, entre os dois underscores)

\- Verifica se está na lista permitida para o tipo\_documento

\- Rejeita com mensagem clara: "documento\_id '{id}' tem qualidade '{q}' que não é válida para tipo\_documento '{tipo}'. Qualidades válidas: {lista}"



Adicione ao fixture inválido (corpus\_catalog\_invalido\_sintetico.json) um quarto erro deliberado: um documento com documento\_id "escritura\_mono\_001" e tipo\_documento "ESCRITURA\_COMPRA\_VENDA". Rode o validador, confirme exit code 1, mostre a mensagem de erro específica para esse caso.



CORREÇÃO DE HIGIENE (opcional, mas recomendada)



Você criou fixtures duplicados:

\- tests/fixtures/sintetico\_escritura\_001\_gt.json (root)

\- tests/fixtures/gt\_valido/ (directory com cópia)

\- tests/fixtures/sintetico\_escritura\_001\_gt\_invalido.json (root)

\- tests/fixtures/gt\_invalido/ (directory com cópia)



Isso confunde qual é a fonte. Se validar\_ground\_truth.ts precisa de uma pasta (lê \*\_gt.json), deixe apenas as pastas tests/fixtures/gt\_valido/ e tests/fixtures/gt\_invalido/ e remova os arquivos duplicados no root.



Se houver razão específica para manter os duplicados (ex: outro script consome o arquivo-raiz), mantenha mas registre technical-decision-record explicando.



\---



ORDEM:

1\. Responda a verificação obrigatória com teste empírico de escritura\_mono\_001

2\. Se precisar corrigir, faça a correção + novo fixture inválido + re-teste

3\. Aplique a higiene de fixtures (ou registre por que não aplicou)

4\. Commit dedicado

5\. PARE



Não autorizo 5C antes de ver o teste empírico de escritura\_mono\_001 funcionando (sendo rejeitado).

