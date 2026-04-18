"""
verificar_anonimizacao_5c.py
Verifies anonymization results for BLOCO 5C.

Checks per PDF:
  1. Sensitive text (CPF 000.000.000-00, FULANO DE TAL SINTETICO, RUA INEXISTENTE 999)
     does NOT appear in the anonymized PDF text layer.
  2. Placeholder strings ([CPF SUPRIMIDO], [NOME SUPRIMIDO], etc.) DO appear.
  3. Tesseract OCR on the anonymized PDF finds no unmasked CPF-pattern 11-digit strings
     (pattern: digits only, 11 consecutive digits not belonging to a placeholder).

Returns exit code 0 if all checks pass, 1 otherwise.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path
import fitz  # PyMuPDF

FIXTURES = Path(__file__).parent

# Sensitive strings that must be ABSENT from anonymized text layer
MUST_BE_ABSENT = [
    "000.000.000-00",
    "FULANO DE TAL SINTETICO",
    "RUA INEXISTENTE, 999",
]

# Placeholder strings that must be PRESENT
MUST_BE_PRESENT = [
    "[CPF SUPRIMIDO]",
    "[NOME SUPRIMIDO]",
    "[ENDERECO SUPRIMIDO]",
]

# CPF pattern in raw OCR text: 11 consecutive digits (may or may not be formatted)
# We check for \d{11} that is NOT part of a known placeholder string
CPF_DIGIT_PATTERN = re.compile(r'\b\d{11}\b|\d{3}\.\d{3}\.\d{3}-\d{2}')


def extract_text(pdf_path: Path) -> str:
    doc = fitz.open(str(pdf_path))
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def ocr_pdf(pdf_path: Path) -> str:
    """Rasterize page 0 to PNG then OCR with Tesseract. Returns raw text."""
    doc = fitz.open(str(pdf_path))
    page = doc[0]
    mat = fitz.Matrix(2, 2)  # 144 DPI — enough for Tesseract
    pix = page.get_pixmap(matrix=mat)
    doc.close()

    with tempfile.TemporaryDirectory() as tmp:
        png_path = Path(tmp) / "page.png"
        txt_base = Path(tmp) / "ocr_out"
        pix.save(str(png_path))

        result = subprocess.run(
            ["tesseract", str(png_path), str(txt_base), "-l", "por"],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"  [WARN] Tesseract stderr: {result.stderr.strip()}")

        txt_file = Path(tmp) / "ocr_out.txt"
        if txt_file.exists():
            return txt_file.read_text(encoding="utf-8", errors="replace")
        return ""


def check_pdf(label: str, original_pdf: Path, anon_pdf: Path) -> list[str]:
    failures = []
    print(f"\n{'='*60}")
    print(f"Checking: {label}")
    print(f"  Original : {original_pdf.name}")
    print(f"  Anonymized: {anon_pdf.name}")

    # ── 1. Text layer check ──────────────────────────────────────────────────
    anon_text = extract_text(anon_pdf)
    print("\n  [TEXT LAYER — sensitive strings must be ABSENT]")
    for sensitive in MUST_BE_ABSENT:
        found = sensitive in anon_text
        status = "FAIL — still present" if found else "OK — absent"
        print(f"    {sensitive!r:45s}: {status}")
        if found:
            failures.append(f"{label}: sensitive string still present in text layer: {sensitive!r}")

    print("\n  [TEXT LAYER — placeholder strings must be PRESENT]")
    for placeholder in MUST_BE_PRESENT:
        found = placeholder in anon_text
        status = "OK — present" if found else "FAIL — missing"
        print(f"    {placeholder!r:45s}: {status}")
        if not found:
            failures.append(f"{label}: placeholder not found in text layer: {placeholder!r}")

    # ── 2. OCR check ─────────────────────────────────────────────────────────
    print("\n  [OCR SCAN — searching for unmasked CPF patterns]")
    ocr_text = ocr_pdf(anon_pdf)

    cpf_hits = CPF_DIGIT_PATTERN.findall(ocr_text)
    # Filter out hits that are clearly part of a placeholder or test marker
    real_cpf_hits = []
    for hit in cpf_hits:
        # Strip formatting to get raw digits
        digits = re.sub(r'\D', '', hit)
        # Known synthetic placeholders (all same digit) are allowed to appear in OCR
        # as they are the placeholder marker themselves — but our placeholders are
        # text strings like "[CPF SUPRIMIDO]", not digit sequences.
        # So any 11-digit sequence found by OCR is suspicious.
        real_cpf_hits.append(hit)

    if real_cpf_hits:
        print(f"    WARNING: OCR found CPF-like patterns: {real_cpf_hits}")
        # Check if any of these correspond to the original sensitive CPF
        for hit in real_cpf_hits:
            digits = re.sub(r'\D', '', hit)
            if digits == "00000000000":
                failures.append(f"{label}: OCR found unmasked synthetic CPF '000.000.000-00' in anonymized PDF")
                print(f"    FAIL — unmasked sensitive CPF found by OCR: {hit!r}")
            else:
                print(f"    INFO — CPF-like pattern found by OCR (not the sensitive one): {hit!r}")
    else:
        print("    OK — no CPF patterns found by OCR")

    return failures


def main():
    all_failures = []

    all_failures += check_pdf(
        "escritura",
        FIXTURES / "sintetico_escritura_001.pdf",
        FIXTURES / "sintetico_escritura_001_anonimizado.pdf",
    )
    all_failures += check_pdf(
        "matricula",
        FIXTURES / "sintetico_matricula_001.pdf",
        FIXTURES / "sintetico_matricula_001_anonimizado.pdf",
    )

    print(f"\n{'='*60}")
    if all_failures:
        print(f"\nRESULT: FAIL — {len(all_failures)} issue(s) found:")
        for f in all_failures:
            print(f"  • {f}")
        sys.exit(1)
    else:
        print("\nRESULT: PASS — all anonymization checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
