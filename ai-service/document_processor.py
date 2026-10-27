from pathlib import Path

from pypdf import PdfReader
from docx import Document


def extract_pdf_text(file_path):
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages).strip()


def extract_docx_text(file_path):
    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return "\n".join(paragraphs).strip()


def extract_txt_text(file_path):
    return Path(file_path).read_text(
        encoding="utf-8",
        errors="ignore"
    ).strip()


def extract_text(file_path):
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    extension = path.suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    if extension == ".txt":
        return extract_txt_text(file_path)

    raise ValueError(
        f"Unsupported file type: {extension}"
    )


if __name__ == "__main__":
    print("Document processor is ready.")