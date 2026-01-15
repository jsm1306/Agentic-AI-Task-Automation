import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from pdf2image import convert_from_path
POPPLER_PATH =r"C:\poppler-25.12.0\Library\bin"
from pathlib import Path

def ocr_pages(pdf_path, page_numbers, output_path):
    images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
    text = []

    for i in page_numbers:
        page_text = pytesseract.image_to_string(images[i])
        text.append(page_text)

    Path(output_path).write_text("\n\n".join(text), encoding="utf-8")
