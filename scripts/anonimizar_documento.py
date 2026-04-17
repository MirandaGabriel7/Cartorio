"""
anonimizar_documento.py
Aplica retângulos opacos sobre campos sensíveis e sobrepõe placeholders.
Usa PyMuPDF (fitz) para manipulação de PDF.

Entrada: PDF original + CSV de controle com colunas:
  pagina, x0, y0, x1, y1, campo, valor_original, valor_placeholder

Saída: PDF anonimizado em corpus/anonimizados/

Uso:
  python scripts/anonimizar_documento.py <pdf_path> <controle_csv> <output_path>

Exemplo:
  python scripts/anonimizar_documento.py \\
    corpus/originais/escrituras/escritura_boa_001.pdf \\
    corpus/originais/escrituras/escritura_boa_001_controle.csv \\
    corpus/anonimizados/escrituras/escritura_boa_001.pdf
"""
import fitz  # PyMuPDF
import csv
import sys
from pathlib import Path


def anonimizar(pdf_path: str, controle_csv: str, output_path: str):
    doc = fitz.open(pdf_path)
    with open(controle_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pagina = int(row['pagina']) - 1  # 0-indexed
            rect = fitz.Rect(
                float(row['x0']), float(row['y0']),
                float(row['x1']), float(row['y1'])
            )
            page = doc[pagina]
            # Cobrir com retângulo branco
            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
            # Inserir placeholder
            page.insert_text(
                fitz.Point(float(row['x0']) + 2, float(row['y1']) - 2),
                row['valor_placeholder'],
                fontsize=8,
                fontname="Courier"
            )
    doc.save(output_path)
    doc.close()


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Uso: python anonimizar_documento.py <pdf_path> <controle_csv> <output_path>")
        sys.exit(1)
    anonimizar(sys.argv[1], sys.argv[2], sys.argv[3])
