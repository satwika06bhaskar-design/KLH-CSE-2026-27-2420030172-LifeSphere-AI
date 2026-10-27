from document_processor import extract_text


file_path = "test_document.txt"

text = extract_text(file_path)

print("\n===== EXTRACTED TEXT =====\n")
print(text)
print("\n===== END =====")