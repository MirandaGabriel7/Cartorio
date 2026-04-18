Revisei o relatório do 5A. A maioria dos problemas da primeira tentativa foi corrigida: 8 schemas entregues no caminho certo, metaschema check passou. Três correções finais antes de autorizar 5B.

CORREÇÃO 1 — Confirmar configuração do AJV

O relatório não menciona se a configuração AJV foi corrigida. Na primeira tentativa você usou new Ajv({ strict: false, validateFormats: false }), o que desativa silenciosamente a validação de "format" (date, date-time, etc).

Responda:

(a) Qual é a configuração AJV atual usada no metaschema check do relatório acima?
(b) ajv-formats está instalado? (cheque package.json e node_modules/ajv-formats)
(c) Quando um schema declara "format": "date", essa validação está ATIVA ou INATIVA na instância AJV atual?

Se a configuração ainda está com validateFormats: false (ou equivalente que desativa formats), corrija agora:
```
npm install --save-dev ajv-formats
```
E na instância AJV:
```
import Ajv from "ajv"
import addFormats from "ajv-formats"
const ajv = new Ajv({ strict: false, allErrors: true })
addFormats(ajv)
```

Se já está correto, me diga exatamente qual é a configuração em uso, e por que você não precisou do ajv-formats (explicação técnica específica, não genérica).

Rode um teste empírico para provar que formats estão ativos: crie um JSON temporário com uma data inválida como "2026-13-45" em um campo que seu schema declara como "format": "date" e valide. AJV deve rejeitar. Cole a saída.

CORREÇÃO 2 — Formalizar as 6 decisões autônomas

Você listou 6 decisões autônomas no relatório. Duas delas (Draft-07 e definitions vs $defs) foram autorizadas explicitamente no Bloco 5A da instrução original — essas não precisam de registro adicional.

Mas as outras 4 precisam ser registradas formalmente em decisoes/decisao_setup_ambiente.md usando .claude/templates/technical-decision-record.md, agrupadas sob um header "Schema interpretation decisions — BLOCO 5A":

- Decisão 3: documento_id pattern derivado da Seção 3.3.1 (mais preciso que .md genérico)
- Decisão 4: categoria_corpus enum derivado da Seção 3.1 (15 valores)
- Decisão 5: checklist_gabarito typed como string (não enum) devido a valores field-specific
- Decisão 6: hash_arquivo sem regex (dois protocolos aceitos)

Cada uma com Context / Alternatives / Decision / Justification / Impact / Approved by (aprovação retroativa nesta mensagem) / Evidence.

"Registrado em $comment no schema" NÃO é registro suficiente. $comment é reforço documentacional, não substitui o technical-decision-record em decisoes/.

CORREÇÃO 3 — Mostrar o regex real de documento_id

Você disse que aplicou o pattern derivado da Seção 3.3.1, que enumera 13 valores de qualidade. Cole aqui o regex exato que está em corpus-catalog.schema.json para o campo documento_id.

Critérios de aceite para esse regex (eu vou verificar):

(a) Deve aceitar os 13 valores de qualidade da Seção 3.3.1: boa, degradada, baixa, nativa, mono, onus, rural, transporte, multi, pj, rogo, marca, prenot
(b) Deve aceitar os 2 valores de tipo: escritura, matricula
(c) Deve exigir exatamente 3 dígitos para sequencial
(d) Deve ser ancorado (^...$) para não aceitar substring
(e) Testar empiricamente contra estes inputs (cole a saída):
    - Válidos (devem passar): escritura_boa_001, matricula_mono_015, escritura_marca_123, matricula_transporte_999
    - Inválidos (devem falhar): escritura_boa_01 (sequencial de 2 dígitos), matricula_invalida_001 (qualidade inexistente), Escritura_boa_001 (case wrong), contrato_boa_001 (tipo inexistente), escritura_boa_001_extra (sufixo extra), escritura_mono_001 (mono é qualidade de matricula, não de escritura — esse é edge case; se passar no regex, registre como limitação conhecida no comentário)

Se algum dos testes inválidos passar ou algum válido falhar, o regex precisa ajuste.

Observação sobre o edge case de escritura_mono_001: O plano Seção 3.3.1 lista "mono" como qualidade aplicável apenas a matrículas (conceito que faz sentido: só matrículas têm formato monoespaçado, escrituras não). Um regex perfeito distinguiria quais qualidades aplicam a qual tipo. Mas isso pode exigir regex complexo com alternation condicional. Decida:

- Opção A: regex simples que aceita qualquer combinação tipo×qualidade (pode passar combinações semanticamente impossíveis como escritura_mono_xxx)
- Opção B: regex com alternation que reflete quais qualidades aplicam a cada tipo

Se escolher A, registre como decisão técnica com a limitação explícita ("validator script ou coleta manual deve impedir combinações inválidas"). Se escolher B, garanta que cobre todos os casos válidos da Seção 3.1.

Recomendo A (simples, registrada) — a semântica tipo×qualidade é responsabilidade da catalogação humana e do validador, não do regex do schema.

---

ORDEM:
1. Responda as 3 verificações.
2. Aplique as correções necessárias.
3. Commit dedicado com mensagem descritiva.
4. PARE.

Não autorizo 5B antes de ver a saída do teste de regex e a confirmação do AJV com ajv-formats.