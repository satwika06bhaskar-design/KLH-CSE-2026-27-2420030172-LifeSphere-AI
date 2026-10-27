from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
CHROMA_DIR = BASE_DIR / "chroma_db"


# ---------------------------------------------------------
# Embedding Model
# ---------------------------------------------------------

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded.")


# ---------------------------------------------------------
# ChromaDB
# ---------------------------------------------------------

chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = chroma_client.get_or_create_collection(
    name="lifesphere_documents"
)


# ---------------------------------------------------------
# Chunking
# ---------------------------------------------------------

def chunk_text(text, chunk_size=500, overlap=100):
    """
    Split document text into overlapping chunks.
    """

    text = text.strip()

    if not text:
        return []

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


# ---------------------------------------------------------
# Add Document
# ---------------------------------------------------------

def add_document(
    document_id,
    file_name,
    text
):
    """
    Extracted document text is divided into chunks,
    converted into embeddings, and stored in ChromaDB.
    """

    chunks = chunk_text(text)

    if not chunks:
        return 0

    embeddings = embedding_model.encode(
        chunks,
        normalize_embeddings=True
    ).tolist()

    ids = [
        f"{document_id}_chunk_{index}"
        for index in range(len(chunks))
    ]

    metadatas = [
        {
            "document_id": str(document_id),
            "file_name": file_name,
            "chunk_index": index
        }
        for index in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(chunks)
# ---------------------------------------------------------
# Delete Document
# ---------------------------------------------------------

def delete_document(document_id):
    """
    Delete all ChromaDB chunks belonging to a document.
    """

    document_id = str(document_id)

    results = collection.get(
        where={
            "document_id": document_id
        }
    )

    ids = results.get("ids", [])

    if ids:
        collection.delete(ids=ids)

    return len(ids)

# ---------------------------------------------------------
# Search Documents
# ---------------------------------------------------------

def search_documents(
    query,
    top_k=3
):
    """
    Find the most relevant document chunks
    for a user query.
    """

    query_embedding = embedding_model.encode(
        [query],
        normalize_embeddings=True
    ).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )

    return results


# ---------------------------------------------------------
# Test
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\nTesting RAG storage...\n")

    test_text = """
    LifeSphere AI is a personal AI assistant.

    Insurance Policy:
    Policy Number: LS123456
    Policy Provider: LifeSecure Insurance
    Premium: 25000 INR
    Expiry Date: 15 March 2027.

    The insurance policy should be renewed before
    the expiry date.
    """

    document_id = "test_document"

    count = add_document(
        document_id,
        "test_document.txt",
        test_text
    )

    print(f"Stored chunks: {count}")

    results = search_documents(
        "What is the insurance policy number?"
    )

    print("\n===== SEARCH RESULTS =====\n")

    for document in results["documents"][0]:
        print(document)
        print("-------------------------")

    print("\nRAG storage test completed.")