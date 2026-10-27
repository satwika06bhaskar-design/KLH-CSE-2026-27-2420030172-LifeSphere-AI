from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

from document_processor import extract_text
from rag_chat import generate_rag_response
from rag_store import add_document, delete_document


app = Flask(__name__)
CORS(app)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def home():

    return jsonify({
        "service": "LifeSphere AI Service",
        "status": "running",
        "model": "llama3.2:1b",
        "rag": True
    })


# =========================================================
# AI CHAT
# =========================================================

@app.post("/generate")
def generate():

    data = request.get_json(silent=True) or {}

    message = data.get("message", "").strip()

    if not message:

        return jsonify({
            "error": "Message is required."
        }), 400

    try:

        response = generate_rag_response(
            message,
            top_k=3
        )

        return jsonify({
            "response": response
        })

    except Exception as e:

        print("RAG/Ollama error:", e)

        return jsonify({
            "error": "Could not generate AI response.",
            "details": str(e)
        }), 500


# =========================================================
# DOCUMENT INGESTION
# =========================================================

@app.post("/ingest")
def ingest():

    uploaded_file = request.files.get("file")

    document_id = request.form.get("documentId")
    file_name = request.form.get("fileName")

    if uploaded_file is None:

        return jsonify({
            "error": "No file received."
        }), 400

    if not document_id:

        return jsonify({
            "error": "Document ID is required."
        }), 400

    if not file_name:

        file_name = uploaded_file.filename

    if not file_name:

        return jsonify({
            "error": "File name is required."
        }), 400

    # -----------------------------------------------------
    # Create temporary directory
    # -----------------------------------------------------

    temp_directory = Path("rag_temp")

    temp_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    # Use only the filename portion to avoid path traversal
    safe_file_name = Path(
        file_name
    ).name

    temp_file = (
        temp_directory
        / safe_file_name
    )

    try:

        # -------------------------------------------------
        # Save temporary copy
        # -------------------------------------------------

        uploaded_file.save(temp_file)

        # -------------------------------------------------
        # Extract text
        # -------------------------------------------------

        text = extract_text(
            str(temp_file)
        )

        if not text:

            return jsonify({
                "error":
                    "No text could be extracted from "
                    "the document."
            }), 400

        # -------------------------------------------------
        # Store chunks + embeddings
        # -------------------------------------------------

        chunk_count = add_document(
            document_id=document_id,
            file_name=file_name,
            text=text
        )

        print(
            f"RAG ingestion successful: "
            f"{file_name} "
            f"({chunk_count} chunks)"
        )

        return jsonify({
            "message":
                "Document indexed successfully.",
            "documentId":
                document_id,
            "fileName":
                file_name,
            "chunks":
                chunk_count
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:

        print(
            "Document ingestion error:",
            e
        )

        return jsonify({
            "error":
                "Could not index document.",
            "details":
                str(e)
        }), 500

    finally:

        # -------------------------------------------------
        # Delete temporary copy
        # -------------------------------------------------

        try:

            if temp_file.exists():
                temp_file.unlink()

        except Exception as cleanup_error:

            print(
                "Temporary file cleanup failed:",
                cleanup_error
            )


# =========================================================
# DELETE DOCUMENT FROM RAG
# =========================================================

@app.delete("/documents/<document_id>")
def delete_rag_document(document_id):

    try:

        deleted_chunks = delete_document(
            document_id
        )

        print(
            f"RAG deletion successful: "
            f"document_id={document_id}, "
            f"chunks={deleted_chunks}"
        )

        return jsonify({
            "message":
                "Document removed from RAG.",
            "documentId":
                document_id,
            "deletedChunks":
                deleted_chunks
        })

    except Exception as e:

        print(
            "RAG deletion error:",
            e
        )

        return jsonify({
            "error":
                "Could not remove document from RAG.",
            "details":
                str(e)
        }), 500


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )