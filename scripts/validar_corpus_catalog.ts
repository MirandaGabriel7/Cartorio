/**
 * validar_corpus_catalog.ts
 * Full implementation. Validates corpus/corpus_catalog.json against:
 *   1. JSON Schema (scripts/schemas/corpus-catalog.schema.json) via ajv
 *   2. Invariants from .claude/schemas/corpus-catalog.md
 *
 * Output:
 *   - stdout: human-readable summary
 *   - relatorios/validacao_corpus.json
 *
 * Exit codes: 0 = valid, 1 = invalid
 *
 * Usage: npm run validar:corpus
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentoEntry {
  documento_id: string;
  arquivo: string;
  tipo_documento: string;
  categoria_corpus: string;
  classificacao_qualidade: string;
  total_paginas: number;
  tem_texto_nativo: boolean;
  marcas_dagua_presentes: boolean;
  tipo_marca_dagua: string | null;
  rodapes_sistema_presentes: boolean;
  formato_matricula: string | null;
  tem_onus: boolean;
  tipos_onus: string[];
  tem_transporte_ficha: boolean;
  total_transmitentes: number;
  transmitente_pj: boolean;
  assinatura_rogo: boolean;
  urbano_ou_rural: string;
  municipio_origem: string;
  anonimizacao_verificada: boolean;
  data_coleta: string;
  coletado_por: string;
  ground_truth_disponivel: boolean;
  ground_truth_arquivo: string | null;
  observacoes: string;
  status: string;
}

interface CorpusCatalog {
  $schema: string;
  versao: string;
  data_criacao: string;
  total_documentos: number;
  documentos: DocumentoEntry[];
}

interface ValidationError {
  documento_id: string;
  campo: string;
  regra: string;
  mensagem: string;
}

interface ValidationReport {
  data: string;
  total_documentos: number;
  total_validos: number;
  total_erros: number;
  erros: ValidationError[];
}

// ---------------------------------------------------------------------------
// Valid quality codes per tipo_documento — derived from Section 3.1 of the plan.
// Resolves the edge case documented in DECISION-5A-1 (escritura_mono_001 must be rejected).
// "boa" and "degradada" appear in both types as generic quality descriptors.
// ---------------------------------------------------------------------------
const VALID_QUALITIES_PER_TIPO: Record<string, Set<string>> = {
  ESCRITURA_COMPRA_VENDA: new Set(['boa', 'degradada', 'baixa', 'nativa', 'multi', 'pj', 'rogo', 'marca', 'prenot']),
  MATRICULA: new Set(['boa', 'degradada', 'mono', 'onus', 'rural', 'transporte']),
};

// ---------------------------------------------------------------------------
// Category quotas per Section 3.1 of the plan (tracked, not hard-blocked per entry)
// ---------------------------------------------------------------------------
const EXPECTED_QUOTAS: Record<string, number> = {
  'MAT-ATUAL-BOA': 20,
  'MAT-ATUAL-DEG': 20,
  'MAT-MONO': 10,
  'MAT-ONUS': 10,
  'MAT-RURAL': 5,
  'MAT-TRANSP': 5,
  'ESC-NATIVA': 10,
  'ESC-BOA': 20,
  'ESC-DEG': 20,
  'ESC-BAIXA': 10,
  'ESC-MULTI': 5,
  'ESC-PJ': 5,
  'ESC-ROGO': 5,
  'ESC-MARCA': 5,
  'ESC-PRENOT': 5,
};

// Tipo prefix in documento_id must match tipo_documento
const TIPO_ID_PREFIX: Record<string, string> = {
  ESCRITURA_COMPRA_VENDA: 'escritura',
  MATRICULA: 'matricula',
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  // Optional first argument overrides the default catalog path (used in tests).
  const catalogPath = process.argv[2] ?? path.join('corpus', 'corpus_catalog.json');

  // ---- Load catalog -------------------------------------------------------
  if (!fs.existsSync(catalogPath)) {
    console.error(`ERROR: ${catalogPath} not found. Run corpus cataloging first.`);
    process.exit(1);
  }

  let catalog: CorpusCatalog;
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as CorpusCatalog;
  } catch (e) {
    console.error(`ERROR: Failed to parse ${catalogPath}: ${(e as Error).message}`);
    process.exit(1);
  }

  // ---- Load schema --------------------------------------------------------
  const schemaPath = path.join('scripts', 'schemas', 'corpus-catalog.schema.json');
  let schema: unknown;
  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  } catch (e) {
    console.error(`ERROR: Failed to load schema ${schemaPath}: ${(e as Error).message}`);
    process.exit(1);
  }

  // ---- AJV JSON Schema validation -----------------------------------------
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema as object);
  const schemaValid = validate(catalog);

  const errors: ValidationError[] = [];

  if (!schemaValid && validate.errors) {
    for (const err of validate.errors) {
      const instancePath = err.instancePath || '(root)';
      const docIdMatch = instancePath.match(/\/documentos\/(\d+)/);
      const docId = docIdMatch
        ? (catalog.documentos?.[parseInt(docIdMatch[1], 10)]?.documento_id ?? `index[${docIdMatch[1]}]`)
        : '__catalog__';
      errors.push({
        documento_id: docId,
        campo: instancePath,
        regra: 'json_schema',
        mensagem: `${err.message ?? 'schema error'} (${err.keyword} at ${instancePath})`,
      });
    }
  }

  // ---- Invariant checks ---------------------------------------------------
  const documentos: DocumentoEntry[] = Array.isArray(catalog.documentos) ? catalog.documentos : [];

  // total_documentos must equal length of documentos array
  if (typeof catalog.total_documentos === 'number' && catalog.total_documentos !== documentos.length) {
    errors.push({
      documento_id: '__catalog__',
      campo: 'total_documentos',
      regra: 'total_documentos_match',
      mensagem: `total_documentos is ${catalog.total_documentos} but documentos array has ${documentos.length} entries`,
    });
  }

  // Rule 1: documento_id uniqueness
  const seenIds = new Set<string>();
  for (const doc of documentos) {
    const id = doc.documento_id ?? '__missing_id__';
    if (seenIds.has(id)) {
      errors.push({
        documento_id: id,
        campo: 'documento_id',
        regra: 'documento_id_unique',
        mensagem: `documento_id "${id}" is duplicated in the catalog`,
      });
    }
    seenIds.add(id);
  }

  for (const doc of documentos) {
    const id = doc.documento_id ?? '__missing_id__';

    // Rule 2: arquivo exists
    if (doc.arquivo) {
      if (!fs.existsSync(doc.arquivo)) {
        errors.push({
          documento_id: id,
          campo: 'arquivo',
          regra: 'arquivo_exists',
          mensagem: `Referenced arquivo "${doc.arquivo}" does not exist`,
        });
      }
    }

    // Rule 3: ground_truth_disponivel=true → ground_truth_arquivo non-null and exists
    if (doc.ground_truth_disponivel) {
      if (!doc.ground_truth_arquivo) {
        errors.push({
          documento_id: id,
          campo: 'ground_truth_arquivo',
          regra: 'gt_arquivo_required',
          mensagem: `ground_truth_disponivel is true but ground_truth_arquivo is null`,
        });
      } else if (!fs.existsSync(doc.ground_truth_arquivo)) {
        errors.push({
          documento_id: id,
          campo: 'ground_truth_arquivo',
          regra: 'gt_arquivo_exists',
          mensagem: `ground_truth_arquivo "${doc.ground_truth_arquivo}" does not exist`,
        });
      }
    }

    // Rule 4: tipo_documento ↔ documento_id prefix consistency
    if (doc.tipo_documento && doc.documento_id) {
      const expectedPrefix = TIPO_ID_PREFIX[doc.tipo_documento];
      if (expectedPrefix) {
        const idPrefix = doc.documento_id.split('_')[0];
        if (idPrefix !== expectedPrefix) {
          errors.push({
            documento_id: id,
            campo: 'documento_id',
            regra: 'tipo_documento_id_consistency',
            mensagem: `tipo_documento "${doc.tipo_documento}" expects id prefix "${expectedPrefix}" but got "${idPrefix}"`,
          });
        }
      }
    }

    // Check 10: tipo×qualidade semantic validation (resolves DECISION-5A-1 edge case).
    // The JSON Schema regex accepts any cross-product of tipo×qualidade; this check
    // enforces the semantically valid combinations per Section 3.1 of the plan.
    if (doc.tipo_documento && doc.documento_id) {
      const parts = doc.documento_id.split('_');
      if (parts.length >= 3) {
        const qualidade = parts[1];
        const allowed = VALID_QUALITIES_PER_TIPO[doc.tipo_documento];
        if (allowed && !allowed.has(qualidade)) {
          errors.push({
            documento_id: id,
            campo: 'documento_id',
            regra: 'tipo_qualidade_combination',
            mensagem: `documento_id "${id}" has qualidade "${qualidade}" that is not valid for tipo_documento "${doc.tipo_documento}". Valid qualidades: ${[...allowed].join(', ')}`,
          });
        }
      }
    }

    // Rule 5: MATRICULA-specific constraints
    if (doc.tipo_documento === 'MATRICULA') {
      if (doc.transmitente_pj !== false) {
        errors.push({
          documento_id: id,
          campo: 'transmitente_pj',
          regra: 'matricula_transmitente_pj_false',
          mensagem: `MATRICULA must have transmitente_pj=false`,
        });
      }
      if (doc.assinatura_rogo !== false) {
        errors.push({
          documento_id: id,
          campo: 'assinatura_rogo',
          regra: 'matricula_assinatura_rogo_false',
          mensagem: `MATRICULA must have assinatura_rogo=false`,
        });
      }
      if (doc.total_transmitentes !== 0) {
        errors.push({
          documento_id: id,
          campo: 'total_transmitentes',
          regra: 'matricula_total_transmitentes_zero',
          mensagem: `MATRICULA must have total_transmitentes=0, got ${doc.total_transmitentes}`,
        });
      }
    }

    // Rule 6: ESCRITURA_COMPRA_VENDA-specific constraints
    if (doc.tipo_documento === 'ESCRITURA_COMPRA_VENDA') {
      if (doc.formato_matricula !== null) {
        errors.push({
          documento_id: id,
          campo: 'formato_matricula',
          regra: 'escritura_formato_matricula_null',
          mensagem: `ESCRITURA_COMPRA_VENDA must have formato_matricula=null, got "${doc.formato_matricula}"`,
        });
      }
      if (doc.tem_onus !== false) {
        errors.push({
          documento_id: id,
          campo: 'tem_onus',
          regra: 'escritura_tem_onus_false',
          mensagem: `ESCRITURA_COMPRA_VENDA must have tem_onus=false`,
        });
      }
      if (doc.tem_transporte_ficha !== false) {
        errors.push({
          documento_id: id,
          campo: 'tem_transporte_ficha',
          regra: 'escritura_tem_transporte_false',
          mensagem: `ESCRITURA_COMPRA_VENDA must have tem_transporte_ficha=false`,
        });
      }
    }
  }

  // Rule 8: Category quota counts (informational)
  const quotaCounts: Record<string, number> = {};
  for (const doc of documentos) {
    if (doc.categoria_corpus) {
      quotaCounts[doc.categoria_corpus] = (quotaCounts[doc.categoria_corpus] ?? 0) + 1;
    }
  }

  // ---- Tally results ------------------------------------------------------
  const docsWithErrors = new Set(
    errors.filter(e => e.documento_id !== '__catalog__').map(e => e.documento_id)
  );
  const totalValid = documentos.length - docsWithErrors.size;

  // ---- Write relatorio JSON ------------------------------------------------
  const relatoriosDir = 'relatorios';
  if (!fs.existsSync(relatoriosDir)) {
    fs.mkdirSync(relatoriosDir, { recursive: true });
  }
  const reportPath = path.join(relatoriosDir, 'validacao_corpus.json');

  const report: ValidationReport = {
    data: new Date().toISOString(),
    total_documentos: documentos.length,
    total_validos: totalValid,
    total_erros: errors.length,
    erros: errors,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // ---- stdout summary -----------------------------------------------------
  console.log('\n=== Corpus Catalog Validation ===');
  console.log(`Catalog: ${catalogPath}`);
  console.log(`Total documents: ${documentos.length}`);
  console.log(`Documents with errors: ${docsWithErrors.size}`);
  console.log(`Total errors (all rules): ${errors.length}`);
  console.log(`Schema valid: ${schemaValid}`);
  console.log('');

  console.log('--- Category quota counts ---');
  for (const [cat, expected] of Object.entries(EXPECTED_QUOTAS)) {
    const actual = quotaCounts[cat] ?? 0;
    console.log(`  ${cat}: ${actual} / ${expected} expected`);
  }
  console.log('');

  if (errors.length > 0) {
    console.log('--- Errors ---');
    for (const err of errors) {
      console.log(`  [${err.documento_id}] campo="${err.campo}" regra="${err.regra}": ${err.mensagem}`);
    }
    console.log('');
    console.log(`Report written to: ${reportPath}`);
    console.log('Result: INVALID');
    process.exit(1);
  } else {
    console.log(`Report written to: ${reportPath}`);
    console.log('Result: VALID');
    process.exit(0);
  }
}

main();
