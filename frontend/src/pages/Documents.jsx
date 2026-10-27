
import { useEffect, useState } from "react";

import {
  FileText,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  File,
} from "lucide-react";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/documents",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load documents.");
      }

      const data = await response.json();

      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Could not load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // =========================
  // UPLOAD
  // =========================

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setMessage("Uploading document...");

      const response = await fetch(
        "http://localhost:8080/api/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Upload failed."
        );
      }

      setMessage(
        "Document uploaded successfully."
      );

      await loadDocuments();

    } catch (err) {
      console.error(err);

      setMessage("");

      setError(
        err.message || "Upload failed."
      );
    }

    event.target.value = "";
  };

  // =========================
  // DOWNLOAD
  // =========================

  const handleDownload = async (documentItem) => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/documents/${documentItem.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not download document."
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;

      link.download =
        documentItem.fileName;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Could not download document."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(
          data || "Could not delete document."
        );
      }

      setMessage(
        "Document deleted successfully."
      );

      await loadDocuments();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Could not delete document."
      );
    }
  };

  // =========================
  // FILE SIZE
  // =========================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 Bytes";
    }

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return (
      Math.round(
        (bytes /
          Math.pow(1024, index)) *
          100
      ) / 100 +
      " " +
      sizes[index]
    );
  };

  return (
    <div className="documents-page">

      {/* HEADER */}

      <div className="documents-header">

        <div>
          <h1>Documents</h1>

          <p>
            Upload and manage your important documents.
          </p>
        </div>

        <div className="documents-actions">

          <button
            type="button"
            className="refresh-button"
            onClick={loadDocuments}
          >
            <RefreshCw size={18} />

            Refresh
          </button>

          <label className="upload-button">

            <Upload size={18} />

            Upload Document

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleUpload}
              hidden
            />

          </label>

        </div>

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="document-message success">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="document-message error">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="documents-empty">

          <RefreshCw
            size={40}
            className="loading-icon"
          />

          <h3>
            Loading documents...
          </h3>

        </div>

      ) : documents.length === 0 ? (

        /* EMPTY STATE */

        <div className="documents-empty">

          <FileText size={55} />

          <h3>
            No documents yet
          </h3>

          <p>
            Upload your first document
            to get started.
          </p>

        </div>

      ) : (

        /* DOCUMENT LIST */

        <div className="documents-list">

          {documents.map((documentItem) => (

            <div
              className="document-card"
              key={documentItem.id}
            >

              <div className="document-icon">

                <File size={28} />

              </div>

              <div className="document-info">

                <h3>
                  {documentItem.fileName}
                </h3>

                <div className="document-meta">

                  <span>
                    {documentItem.fileType}
                  </span>

                  <span>
                    {formatFileSize(
                      documentItem.fileSize
                    )}
                  </span>

                  <span>
                    {new Date(
                      documentItem.uploadedAt
                    ).toLocaleDateString()}
                  </span>

                </div>

              </div>

              <div className="document-card-actions">

                <button
                  type="button"
                  className="document-action download"
                  onClick={() =>
                    handleDownload(
                      documentItem
                    )
                  }
                  title="Download"
                >
                  <Download size={19} />
                </button>

                <button
                  type="button"
                  className="document-action delete"
                  onClick={() =>
                    handleDelete(
                      documentItem.id
                    )
                  }
                  title="Delete"
                >
                  <Trash2 size={19} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Documents;
