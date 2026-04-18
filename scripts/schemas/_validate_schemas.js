// Metaschema check: validates each schema file against JSON Schema draft-07 meta-schema.
// Run: node scripts/schemas/_validate_schemas.js
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs  = require("fs");
const path = require("path");

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

const schemaDir = path.join(__dirname);
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith(".schema.json"));

let allPassed = true;
console.log("=== Metaschema check (JSON Schema draft-07) ===\n");

for (const file of files.sort()) {
  const fullPath = path.join(schemaDir, file);
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (e) {
    console.error(`PARSE ERROR  ${file}: ${e.message}`);
    allPassed = false;
    continue;
  }

  const valid = ajv.validateSchema(schema);
  if (valid) {
    console.log(`PASS         ${file}`);
  } else {
    console.error(`FAIL         ${file}`);
    for (const err of ajv.errors || []) {
      console.error(`             ${err.instancePath || "/"} — ${err.message}`);
    }
    allPassed = false;
  }
}

console.log("\n" + (allPassed ? "ALL SCHEMAS VALID" : "SOME SCHEMAS FAILED"));
process.exit(allPassed ? 0 : 1);
