from pypdf import PdfReader
from pathlib import Path

def extract_pages(pdf_path, page_numbers, output_path):
    reader = PdfReader(pdf_path)
    extracted_text = []

    for page_num in page_numbers:
        page = reader.pages[page_num]
        extracted_text.append(page.extract_text())

    output_path = Path(output_path)
    output_path.write_text("\n\n".join(extracted_text), encoding="utf-8")
