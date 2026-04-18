"""
gerar_sinteticos_5c.py
Generates 2 synthetic PDFs + control CSVs for BLOCO 5C anonymization test.
All data is completely fictitious. No real PII whatsoever.
"""
import csv
import fitz  # PyMuPDF
from pathlib import Path

FIXTURES = Path(__file__).parent

# ── helpers ──────────────────────────────────────────────────────────────────

def make_pdf_escritura(path: Path):
    """Creates a plausible-looking escritura publica with clearly fake PII."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4

    lines = [
        (50, 60,  14, True,  "ESCRITURA PÚBLICA DE COMPRA E VENDA"),
        (50, 90,  10, False, "Aos dezoito dias do mês de abril do ano de dois mil e vinte e seis,"),
        (50, 105, 10, False, "na cidade de CIDADE FICTICIA, Estado de UF FICTICIO, perante mim,"),
        (50, 120, 10, False, "TABELIAO SINTETICO, Tabelião de Notas do 1.º Ofício, compareceram:"),
        (50, 150, 10, True,  "OUTORGANTE VENDEDOR:"),
        (50, 165, 10, False, "Nome: FULANO DE TAL SINTETICO"),
        (50, 180, 10, False, "CPF: 000.000.000-00"),
        (50, 195, 10, False, "Endereço: RUA INEXISTENTE, 999, BAIRRO FALSO, CIDADE FICTICIA/UF"),
        (50, 225, 10, True,  "OUTORGANTE COMPRADOR:"),
        (50, 240, 10, False, "Nome: BELTRANA SINTETICA DOS SANTOS"),
        (50, 255, 10, False, "CPF: 111.111.111-11"),
        (50, 270, 10, False, "Endereço: AVENIDA IMAGINARIA, 42, CIDADE FICTICIA/UF"),
        (50, 300, 10, True,  "DO IMÓVEL:"),
        (50, 315, 10, False, "Matrícula n.º 99999 do Cartório de Registro de Imóveis de CIDADE FICTICIA."),
        (50, 330, 10, False, "Imóvel situado na RUA INEXISTENTE, 999, com área de 120 m²."),
        (50, 360, 10, True,  "DO PREÇO:"),
        (50, 375, 10, False, "R$ 100.000,00 (cem mil reais), pagos neste ato."),
        (50, 420, 10, False, "Lido e achado conforme, assinam as partes e testemunhas."),
        (50, 460, 10, False, "_____________________________    _____________________________"),
        (50, 475, 10, False, "FULANO DE TAL SINTETICO         BELTRANA SINTETICA DOS SANTOS"),
    ]

    for x, y, size, bold, text in lines:
        fn = "Helvetica-Bold" if bold else "Helvetica"
        page.insert_text(fitz.Point(x, y), text, fontsize=size, fontname=fn, color=(0, 0, 0))

    doc.save(str(path))
    doc.close()


def make_pdf_matricula(path: Path):
    """Creates a plausible-looking matricula with clearly fake PII."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    lines = [
        (50, 60,  14, True,  "MATRÍCULA N.º 99999"),
        (50, 80,  10, False, "CARTÓRIO DE REGISTRO DE IMÓVEIS DE CIDADE FICTICIA"),
        (50, 95,  10, False, "Abertura: 01/01/2000"),
        (50, 130, 10, True,  "DADOS DO IMÓVEL"),
        (50, 145, 10, False, "Localização: RUA INEXISTENTE, 999, BAIRRO FALSO, CIDADE FICTICIA/UF"),
        (50, 160, 10, False, "Área total: 120,00 m²  |  Área construída: 80,00 m²"),
        (50, 195, 10, True,  "PROPRIETÁRIO ATUAL"),
        (50, 210, 10, False, "Nome: FULANO DE TAL SINTETICO"),
        (50, 225, 10, False, "CPF: 000.000.000-00"),
        (50, 240, 10, False, "Endereço: RUA INEXISTENTE, 999, CIDADE FICTICIA/UF"),
        (50, 270, 10, True,  "ÔNUS E RESTRIÇÕES"),
        (50, 285, 10, False, "Nenhum ônus constante nesta data."),
        (50, 320, 10, True,  "REGISTRO DE AQUISIÇÃO"),
        (50, 335, 10, False, "R-1: Compra e venda lavrada em 01/01/2000. Valor: R$ 50.000,00."),
        (50, 350, 10, False, "Vendedor: CICLANO SINTETICO — CPF: 222.222.222-22"),
        (50, 390, 10, False, "Certidão emitida em 18/04/2026 pelo Cartório Fictício."),
    ]

    for x, y, size, bold, text in lines:
        fn = "Helvetica-Bold" if bold else "Helvetica"
        page.insert_text(fitz.Point(x, y), text, fontsize=size, fontname=fn, color=(0, 0, 0))

    doc.save(str(path))
    doc.close()


def extract_rect_for_text(pdf_path: Path, pagina_1indexed: int, search_text: str):
    """Returns bounding rect of first occurrence of search_text on given page."""
    doc = fitz.open(str(pdf_path))
    page = doc[pagina_1indexed - 1]
    hits = page.search_for(search_text)
    doc.close()
    if not hits:
        raise ValueError(f"Text not found on page {pagina_1indexed}: {search_text!r}")
    r = hits[0]
    return round(r.x0 - 1, 2), round(r.y0 - 1, 2), round(r.x1 + 1, 2), round(r.y1 + 1, 2)


def extract_all_rects_for_text(pdf_path: Path, pagina_1indexed: int, search_text: str):
    """Returns bounding rects of ALL occurrences of search_text on given page."""
    doc = fitz.open(str(pdf_path))
    page = doc[pagina_1indexed - 1]
    hits = page.search_for(search_text)
    doc.close()
    return [
        (round(r.x0 - 1, 2), round(r.y0 - 1, 2), round(r.x1 + 1, 2), round(r.y1 + 1, 2))
        for r in hits
    ]


def make_controle_csv(csv_path: Path, rows: list[dict]):
    """rows: list of dicts with keys pagina,x0,y0,x1,y1,campo,valor_original,valor_placeholder"""
    fieldnames = ["pagina", "x0", "y0", "x1", "y1", "campo", "valor_original", "valor_placeholder"]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    # ── escritura ────────────────────────────────────────────────────────────
    escritura_pdf  = FIXTURES / "sintetico_escritura_001.pdf"
    escritura_csv  = FIXTURES / "sintetico_escritura_001_controle.csv"
    matricula_pdf  = FIXTURES / "sintetico_matricula_001.pdf"
    matricula_csv  = FIXTURES / "sintetico_matricula_001_controle.csv"

    print("Generating sintetico_escritura_001.pdf …")
    make_pdf_escritura(escritura_pdf)

    # Locate exact bounding boxes for sensitive fields
    e_cpf_vendedor    = extract_rect_for_text(escritura_pdf, 1, "000.000.000-00")
    e_nomes_vendedor  = extract_all_rects_for_text(escritura_pdf, 1, "FULANO DE TAL SINTETICO")
    e_end_vendedor    = extract_rect_for_text(escritura_pdf, 1, "RUA INEXISTENTE, 999, BAIRRO FALSO")
    e_end_imovel      = extract_rect_for_text(escritura_pdf, 1, "RUA INEXISTENTE, 999, com área")

    controle_escritura: list[dict] = [
        {
            "pagina": 1,
            "x0": e_cpf_vendedor[0], "y0": e_cpf_vendedor[1],
            "x1": e_cpf_vendedor[2], "y1": e_cpf_vendedor[3],
            "campo": "cpf_vendedor",
            "valor_original": "000.000.000-00",
            "valor_placeholder": "[CPF SUPRIMIDO]",
        },
    ]
    # Cover every occurrence of the name (name line + signature line)
    for idx, r in enumerate(e_nomes_vendedor):
        controle_escritura.append({
            "pagina": 1,
            "x0": r[0], "y0": r[1], "x1": r[2], "y1": r[3],
            "campo": f"nome_vendedor_{idx + 1}",
            "valor_original": "FULANO DE TAL SINTETICO",
            "valor_placeholder": "[NOME SUPRIMIDO]",
        })
    controle_escritura += [
        {
            "pagina": 1,
            "x0": e_end_vendedor[0], "y0": e_end_vendedor[1],
            "x1": e_end_vendedor[2], "y1": e_end_vendedor[3],
            "campo": "endereco_vendedor",
            "valor_original": "RUA INEXISTENTE, 999, BAIRRO FALSO",
            "valor_placeholder": "[ENDERECO SUPRIMIDO]",
        },
        {
            "pagina": 1,
            "x0": e_end_imovel[0], "y0": e_end_imovel[1],
            "x1": e_end_imovel[2], "y1": e_end_imovel[3],
            "campo": "endereco_imovel",
            "valor_original": "RUA INEXISTENTE, 999",
            "valor_placeholder": "[ENDERECO IMOVEL SUPRIMIDO]",
        },
    ]
    make_controle_csv(escritura_csv, controle_escritura)
    print(f"  CSV written: {escritura_csv}")

    # ── matrícula ─────────────────────────────────────────────────────────────
    print("Generating sintetico_matricula_001.pdf …")
    make_pdf_matricula(matricula_pdf)

    m_cpf        = extract_rect_for_text(matricula_pdf, 1, "000.000.000-00")
    m_nome       = extract_rect_for_text(matricula_pdf, 1, "FULANO DE TAL SINTETICO")
    m_end_prop   = extract_rect_for_text(matricula_pdf, 1, "RUA INEXISTENTE, 999, CIDADE FICTICIA/UF")
    m_end_imovel = extract_rect_for_text(matricula_pdf, 1, "RUA INEXISTENTE, 999, BAIRRO FALSO")

    controle_matricula = [
        {
            "pagina": 1,
            "x0": m_cpf[0],      "y0": m_cpf[1],
            "x1": m_cpf[2],      "y1": m_cpf[3],
            "campo": "cpf_proprietario",
            "valor_original": "000.000.000-00",
            "valor_placeholder": "[CPF SUPRIMIDO]",
        },
        {
            "pagina": 1,
            "x0": m_nome[0],     "y0": m_nome[1],
            "x1": m_nome[2],     "y1": m_nome[3],
            "campo": "nome_proprietario",
            "valor_original": "FULANO DE TAL SINTETICO",
            "valor_placeholder": "[NOME SUPRIMIDO]",
        },
        {
            "pagina": 1,
            "x0": m_end_prop[0], "y0": m_end_prop[1],
            "x1": m_end_prop[2], "y1": m_end_prop[3],
            "campo": "endereco_proprietario",
            "valor_original": "RUA INEXISTENTE, 999, CIDADE FICTICIA/UF",
            "valor_placeholder": "[ENDERECO SUPRIMIDO]",
        },
        {
            "pagina": 1,
            "x0": m_end_imovel[0], "y0": m_end_imovel[1],
            "x1": m_end_imovel[2], "y1": m_end_imovel[3],
            "campo": "endereco_imovel",
            "valor_original": "RUA INEXISTENTE, 999",
            "valor_placeholder": "[ENDERECO IMOVEL SUPRIMIDO]",
        },
    ]
    make_controle_csv(matricula_csv, controle_matricula)
    print(f"  CSV written: {matricula_csv}")
    print("Done. All synthetic PDFs and CSVs generated.")


if __name__ == "__main__":
    main()
