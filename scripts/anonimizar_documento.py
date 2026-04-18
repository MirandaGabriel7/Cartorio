"""
anonimizar_documento.py
Aplica redação real sobre campos sensíveis usando a API de redação do PyMuPDF,
que remove o conteúdo textual do stream do PDF (não apenas cobertura visual).

Entrada: PDF original + CSV de controle com colunas:
  pagina, x0, y0, x1, y1, campo, valor_original, valor_placeholder

Saída: PDF anonimizado com texto sensível removido do stream.

Uso:
  python scripts/anonimizar_documento.py <pdf_path> <controle_csv> <output_path>

Exemplo:
  python scripts/anonimizar_documento.py \\
    corpus/originais/escrituras/escritura_boa_001.pdf \\
    corpus/originais/escrituras/escritura_boa_001_controle.csv \\
    corpus/anonimizados/escrituras/escritura_boa_001.pdf
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

import fitz  # PyMuPDF


def anonimizar(pdf_path: str, controle_csv: str, output_path: str):
    doc = fitz.open(pdf_path)

    # Load all rows and group by page (0-indexed)
    by_page: dict[int, list[dict]] = defaultdict(list)
    with open(controle_csv, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            by_page[int(row['pagina']) - 1].append(row)

    for page_idx, rows in by_page.items():
        page = doc[page_idx]
        for row in rows:
            rect = fitz.Rect(
                float(row['x0']), float(row['y0']),
                float(row['x1']), float(row['y1'])
            )
            # add_redact_annot marks the area; apply_redactions() removes content
            page.add_redact_annot(
                rect,
                text=row['valor_placeholder'],
                fontname="Cour",
                fontsize=8,
                fill=(1, 1, 1),
                text_color=(0, 0, 0),
            )
        # Apply all redactions on this page at once — actually strips text from stream
        page.apply_redactions()

    doc.save(output_path)
    doc.close()


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Uso: python anonimizar_documento.py <pdf_path> <controle_csv> <output_path>")
        sys.exit(1)
    anonimizar(sys.argv[1], sys.argv[2], sys.argv[3])
