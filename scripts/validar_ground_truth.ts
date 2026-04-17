/**
 * validar_ground_truth.ts
 * Validates ground truth JSON files under corpus/ground_truth/ against the
 * schema defined in .claude/schemas/ground-truth.md and Section 3.4 of the plan.
 *
 * Checks performed:
 *   1. JSON Schema validation via ajv
 *   2. Required fields (obrigatorio: true) present and non-null
 *   3. CPFs: 11-digit strings; CNPJs: 14-digit strings
 *   4. Dates in ISO 8601 format
 *   5. Monetary values as integer cents
 *   6. documento_id matches an entry in corpus_catalog.json
 *   7. checklist_gabarito has all 34 items
 *   8. texto_completo_por_pagina covers all pages with mandatory fields
 *   9. Detects field-level discordances between two annotators (if both present)
 *
 * Output: relatorios/validacao_ground_truth.json
 *
 * Usage: npm run validar:gt
 */

import * as fs from 'fs';
import * as path from 'path';

// Full validation logic implemented during Activity #5
// (Anotação ground truth — primeiros 30 docs)

function main(): void {
  const gtDir = path.join('corpus', 'ground_truth');

  if (!fs.existsSync(gtDir)) {
    console.error(`ERROR: ${gtDir} not found.`);
    process.exit(1);
  }

  const files = fs.readdirSync(gtDir).filter(f => f.endsWith('_gt.json'));
  console.log(`Found ${files.length} ground truth file(s).`);
  console.log('Skeleton: validation logic not yet implemented. Run during Activity #5.');
  process.exit(0);
}

main();
