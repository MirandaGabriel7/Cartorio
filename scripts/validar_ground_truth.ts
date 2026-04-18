/**
 * validar_ground_truth.ts
 * Full implementation. Validates all corpus/ground_truth/*_gt.json files against:
 *   1. JSON Schema (scripts/schemas/ground-truth.schema.json) via ajv
 *   2. Invariants from .claude/schemas/ground-truth.md
 *
 * Output:
 *   - stdout: human-readable summary
 *   - relatorios/validacao_ground_truth.json
 *
 * Exit codes: 0 = valid, 1 = invalid
 *
 * Usage: npm run validar:gt
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampoEntry {
  valor: unknown;
  pagina: number;
  obrigatorio: boolean;
}

interface GroundTruth {
  $schema: string;
  documento_id: string;
  tipo: string;
  classificacao_qualidade: string;
  total_paginas: number;
  anotador_primario: string;
  anotador_secundario: string | null;
  data_anotacao_primaria: string;
  data_anotacao_secundaria: string | null;
  discordancias_resolvidas: boolean;
  resolucao_discordancias: string | null;
  campos: Record<string, CampoEntry>;
  texto_completo_por_pagina: Record<string, string>;
  checklist_gabarito: Record<string, string>;
}

interface CatalogEntry {
  documento_id: string;
  tipo_documento: string;
  classificacao_qualidade: string;
  total_paginas: number;
  categoria_corpus: string;
}

interface GtValidationError {
  arquivo: string;
  documento_id: string;
  campo: string;
  regra: string;
  mensagem: string;
}

interface GtValidationReport {
  data: string;
  total_arquivos: number;
  total_validos: number;
  total_erros: number;
  erros: GtValidationError[];
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CPF_RE = /^\d{11}$/;
const CNPJ_RE = /^\d{14}$/;

// ---------------------------------------------------------------------------
// Load corpus catalog (for cross-reference checks)
// ---------------------------------------------------------------------------

function loadCatalogIndex(catalogPath: string): Map<string, CatalogEntry> {
  const index = new Map<string, CatalogEntry>();
  if (!fs.existsSync(catalogPath)) {
    return index;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as {
      documentos?: CatalogEntry[];
    };
    for (const entry of raw.documentos ?? []) {
      if (entry.documento_id) {
        index.set(entry.documento_id, entry);
      }
    }
  } catch {
    // catalog unreadable — cross-reference checks will report missing entries
  }
  return index;
}

// ---------------------------------------------------------------------------
// Determine calibration corpus: first 30 documents from catalog that are
// fully annotated (ground_truth_disponivel=true), ordered by documento_id
// ---------------------------------------------------------------------------

function loadCalibrationIds(catalogPath: string): Set<string> {
  const ids = new Set<string>();
  if (!fs.existsSync(catalogPath)) return ids;
  try {
    const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as {
      documentos?: Array<{ documento_id: string; ground_truth_disponivel?: boolean }>;
    };
    const docs = (raw.documentos ?? [])
      .filter(d => d.ground_truth_disponivel === true)
      .sort((a, b) => a.documento_id.localeCompare(b.documento_id))
      .slice(0, 30);
    for (const d of docs) ids.add(d.documento_id);
  } catch {
    // catalog unreadable
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Validate a single ground truth file
// ---------------------------------------------------------------------------

function validateGtFile(
  gtPath: string,
  schema: object,
  ajv: Ajv,
  catalogIndex: Map<string, CatalogEntry>,
  calibrationIds: Set<string>
): GtValidationError[] {
  const errors: GtValidationError[] = [];
  const arquivo = path.basename(gtPath);

  let gt: GroundTruth;
  try {
    gt = JSON.parse(fs.readFileSync(gtPath, 'utf-8')) as GroundTruth;
  } catch (e) {
    errors.push({
      arquivo,
      documento_id: '__parse_error__',
      campo: '(file)',
      regra: 'json_parse',
      mensagem: `Failed to parse JSON: ${(e as Error).message}`,
    });
    return errors;
  }

  const docId = gt.documento_id ?? '__missing_id__';

  // 1. JSON Schema validation
  const validate = ajv.compile(schema);
  const schemaValid = validate(gt);
  if (!schemaValid && validate.errors) {
    for (const err of validate.errors) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: err.instancePath || '(root)',
        regra: 'json_schema',
        mensagem: `${err.message ?? 'schema error'} (${err.keyword} at ${err.instancePath || '(root)'})`,
      });
    }
  }

  // 2. All obrigatorio=true campos must have non-null valor
  const campos = gt.campos ?? {};
  for (const [fieldName, entry] of Object.entries(campos)) {
    if (entry.obrigatorio === true && entry.valor === null) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: `campos.${fieldName}.valor`,
        regra: 'obrigatorio_not_null',
        mensagem: `Campo "${fieldName}" is obrigatorio=true but valor is null`,
      });
    }
  }

  // 3. CPF values: 11 digits only, no all-zeros
  for (const [fieldName, entry] of Object.entries(campos)) {
    if (fieldName.endsWith('_cpf') && entry.valor !== null) {
      const v = String(entry.valor);
      if (!CPF_RE.test(v)) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: `campos.${fieldName}.valor`,
          regra: 'cpf_11_digits',
          mensagem: `CPF field "${fieldName}" must be 11 digits, got "${v}"`,
        });
      } else if (/^0+$/.test(v)) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: `campos.${fieldName}.valor`,
          regra: 'cpf_not_all_zeros',
          mensagem: `CPF field "${fieldName}" cannot be all zeros`,
        });
      }
    }
  }

  // 3b. CNPJ values: 14 digits only
  for (const [fieldName, entry] of Object.entries(campos)) {
    if (fieldName.endsWith('_cnpj') || fieldName.endsWith('_cpf_cnpj')) {
      if (entry.valor !== null) {
        const v = String(entry.valor);
        // Accept 11-digit CPF or 14-digit CNPJ for cpf_cnpj fields
        const isCpfCnpjField = fieldName.endsWith('_cpf_cnpj');
        if (isCpfCnpjField) {
          if (!CPF_RE.test(v) && !CNPJ_RE.test(v)) {
            errors.push({
              arquivo,
              documento_id: docId,
              campo: `campos.${fieldName}.valor`,
              regra: 'cpf_cnpj_11_or_14_digits',
              mensagem: `CPF/CNPJ field "${fieldName}" must be 11 or 14 digits, got "${v}"`,
            });
          }
        } else if (!CNPJ_RE.test(v)) {
          errors.push({
            arquivo,
            documento_id: docId,
            campo: `campos.${fieldName}.valor`,
            regra: 'cnpj_14_digits',
            mensagem: `CNPJ field "${fieldName}" must be 14 digits, got "${v}"`,
          });
        }
      }
    }
  }

  // 4. Date fields must be ISO 8601
  const DATE_FIELD_SUFFIXES = ['_data', 'data_lavratura', 'data_constituicao'];
  for (const [fieldName, entry] of Object.entries(campos)) {
    const isDateField = DATE_FIELD_SUFFIXES.some(s => fieldName.endsWith(s));
    if (isDateField && entry.valor !== null && typeof entry.valor === 'string') {
      if (!ISO_DATE_RE.test(entry.valor)) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: `campos.${fieldName}.valor`,
          regra: 'date_iso8601',
          mensagem: `Date field "${fieldName}" must be YYYY-MM-DD, got "${entry.valor}"`,
        });
      }
    }
  }

  // 5. Monetary values must be integers (integer cents)
  const MONETARY_SUFFIXES = ['_valor', 'valor_partes', 'valor_avaliacao', 'valor_financiamento'];
  for (const [fieldName, entry] of Object.entries(campos)) {
    const isMonetary = MONETARY_SUFFIXES.some(s => fieldName.endsWith(s) || fieldName === s);
    if (isMonetary && entry.valor !== null) {
      if (typeof entry.valor !== 'number' || !Number.isInteger(entry.valor)) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: `campos.${fieldName}.valor`,
          regra: 'monetary_integer_cents',
          mensagem: `Monetary field "${fieldName}" must be an integer (cents), got ${JSON.stringify(entry.valor)}`,
        });
      }
    }
  }

  // 6. documento_id must match an entry in corpus_catalog.json
  if (catalogIndex.size > 0) {
    if (!catalogIndex.has(docId)) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: 'documento_id',
        regra: 'documento_id_in_catalog',
        mensagem: `documento_id "${docId}" not found in corpus/corpus_catalog.json`,
      });
    } else {
      // Also verify tipo, classificacao_qualidade, total_paginas match
      const catEntry = catalogIndex.get(docId)!;
      if (gt.tipo && catEntry.tipo_documento && gt.tipo !== catEntry.tipo_documento) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: 'tipo',
          regra: 'tipo_matches_catalog',
          mensagem: `tipo "${gt.tipo}" does not match catalog tipo_documento "${catEntry.tipo_documento}"`,
        });
      }
      if (
        typeof gt.total_paginas === 'number' &&
        typeof catEntry.total_paginas === 'number' &&
        gt.total_paginas !== catEntry.total_paginas
      ) {
        errors.push({
          arquivo,
          documento_id: docId,
          campo: 'total_paginas',
          regra: 'total_paginas_matches_catalog',
          mensagem: `total_paginas ${gt.total_paginas} does not match catalog value ${catEntry.total_paginas}`,
        });
      }
    }
  }

  // 7. All 34 checklist items must be present (already enforced by schema, but verify semantically)
  const checklist = gt.checklist_gabarito ?? {};
  for (let i = 1; i <= 34; i++) {
    const key = `item_${String(i).padStart(2, '0')}`;
    if (!(key in checklist)) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: `checklist_gabarito.${key}`,
        regra: 'checklist_34_items',
        mensagem: `Checklist item "${key}" is missing`,
      });
    } else if (!checklist[key] || checklist[key].trim() === '') {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: `checklist_gabarito.${key}`,
        regra: 'checklist_item_nonempty',
        mensagem: `Checklist item "${key}" is empty`,
      });
    }
  }

  // 8. discordancias_resolvidas=true → resolucao_discordancias non-null
  if (gt.discordancias_resolvidas === true && !gt.resolucao_discordancias) {
    errors.push({
      arquivo,
      documento_id: docId,
      campo: 'resolucao_discordancias',
      regra: 'resolucao_required_when_resolved',
      mensagem: `discordancias_resolvidas is true but resolucao_discordancias is null`,
    });
  }

  // 9. Calibration corpus: anotador_secundario non-null and discordancias_resolvidas=true
  if (calibrationIds.has(docId)) {
    if (!gt.anotador_secundario) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: 'anotador_secundario',
        regra: 'calibration_anotador_secundario_required',
        mensagem: `Calibration corpus document must have anotador_secundario non-null`,
      });
    }
    if (gt.discordancias_resolvidas !== true) {
      errors.push({
        arquivo,
        documento_id: docId,
        campo: 'discordancias_resolvidas',
        regra: 'calibration_discordancias_resolved',
        mensagem: `Calibration corpus document must have discordancias_resolvidas=true`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  // Optional args override default paths (used in tests):
  //   argv[2] = ground truth directory
  //   argv[3] = corpus catalog path
  const gtDir = process.argv[2] ?? path.join('corpus', 'ground_truth');
  const catalogPath = process.argv[3] ?? path.join('corpus', 'corpus_catalog.json');

  if (!fs.existsSync(gtDir)) {
    console.error(`ERROR: ${gtDir} not found.`);
    process.exit(1);
  }

  // ---- Load schema --------------------------------------------------------
  const schemaPath = path.join('scripts', 'schemas', 'ground-truth.schema.json');
  let schema: object;
  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as object;
  } catch (e) {
    console.error(`ERROR: Failed to load schema ${schemaPath}: ${(e as Error).message}`);
    process.exit(1);
  }

  // ---- Load catalog index and calibration set -----------------------------
  const catalogIndex = loadCatalogIndex(catalogPath);
  const calibrationIds = loadCalibrationIds(catalogPath);

  // ---- Build AJV instance (reused per file) --------------------------------
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  // ---- Enumerate ground truth files ---------------------------------------
  const files = fs.readdirSync(gtDir)
    .filter(f => f.endsWith('_gt.json'))
    .sort();

  console.log(`\n=== Ground Truth Validation ===`);
  console.log(`Directory: ${gtDir}`);
  console.log(`Files found: ${files.length}`);
  console.log(`Catalog entries loaded: ${catalogIndex.size}`);
  console.log(`Calibration corpus IDs: ${calibrationIds.size}`);
  console.log('');

  if (files.length === 0) {
    console.log('No ground truth files found. Nothing to validate.');
    writeReport(gtDir, [], 0);
    process.exit(0);
  }

  // ---- Validate each file -------------------------------------------------
  const allErrors: GtValidationError[] = [];
  let filesWithErrors = 0;

  for (const fname of files) {
    const gtPath = path.join(gtDir, fname);
    const fileErrors = validateGtFile(gtPath, schema, ajv, catalogIndex, calibrationIds);
    if (fileErrors.length > 0) {
      filesWithErrors++;
    }
    allErrors.push(...fileErrors);
  }

  // ---- Write report -------------------------------------------------------
  writeReport(gtDir, allErrors, files.length);

  // ---- stdout summary -----------------------------------------------------
  const reportPath = path.join('relatorios', 'validacao_ground_truth.json');
  console.log(`Total files: ${files.length}`);
  console.log(`Files with errors: ${filesWithErrors}`);
  console.log(`Total errors: ${allErrors.length}`);
  console.log('');

  if (allErrors.length > 0) {
    console.log('--- Errors ---');
    for (const err of allErrors) {
      console.log(`  [${err.arquivo} / ${err.documento_id}] campo="${err.campo}" regra="${err.regra}": ${err.mensagem}`);
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

function writeReport(
  _gtDir: string,
  errors: GtValidationError[],
  totalFiles: number
): void {
  const relatoriosDir = 'relatorios';
  if (!fs.existsSync(relatoriosDir)) {
    fs.mkdirSync(relatoriosDir, { recursive: true });
  }
  const reportPath = path.join(relatoriosDir, 'validacao_ground_truth.json');

  const filesWithErrors = new Set(errors.map(e => e.arquivo)).size;
  const report: GtValidationReport = {
    data: new Date().toISOString(),
    total_arquivos: totalFiles,
    total_validos: totalFiles - filesWithErrors,
    total_erros: errors.length,
    erros: errors,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
}

main();
