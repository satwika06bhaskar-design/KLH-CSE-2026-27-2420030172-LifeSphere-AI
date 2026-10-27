import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Copy,
  Check,
  Ban,
  Trash2,
  Mail,
  User,
  RefreshCw,
} from "lucide-react";

function EmergencyAccess() {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const token = localStorage.getItem("token");

  const loadEmergencyAccess = async () => {
    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/emergency-access",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load emergency access."
        );
      }

      setAccessList(data);
    } catch (err) {
      console.error("Emergency access load error:", err);
      setError(
        err.message || "Could not load emergency access."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencyAccess();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!contactName.trim() || !contactEmail.trim()) {
      setError("Please enter contact name and email.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/emergency-access",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contactName: contactName.trim(),
            contactEmail: contactEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not create emergency access."
        );
      }

      setAccessList((current) => [data, ...current]);

      setContactName("");
      setContactEmail("");

      setSuccess(
        "Emergency access created successfully."
      );
    } catch (err) {
      console.error("Emergency access create error:", err);

      setError(
        err.message ||
          "Could not create emergency access."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this emergency access?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/emergency-access/${id}/revoke`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not revoke emergency access."
        );
      }

      setAccessList((current) =>
        current.map((item) =>
          item.id === id ? data : item
        )
      );

      setSuccess(
        "Emergency access has been revoked."
      );
    } catch (err) {
      console.error("Emergency access revoke error:", err);

      setError(
        err.message ||
          "Could not revoke emergency access."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this emergency access permanently?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/emergency-access/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not delete emergency access."
        );
      }

      setAccessList((current) =>
        current.filter((item) => item.id !== id)
      );

      setSuccess(
        "Emergency access deleted successfully."
      );
    } catch (err) {
      console.error("Emergency access delete error:", err);

      setError(
        err.message ||
          "Could not delete emergency access."
      );
    }
  };

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(
        item.accessCode
      );

      setCopiedId(item.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Copy error:", err);
      setError("Could not copy the access code.");
    }
  };

  return (
    <div className="emergency-access-page">
      <header className="dashboard-header">
        <div>
          <h1>Emergency Access</h1>

          <p>
            Manage secure emergency access to your
            important information.
          </p>
        </div>

        <div className="header-right">
          <div className="ai-title-icon">
            <Shield size={24} />
          </div>
        </div>
      </header>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      <section className="emergency-access-container">
        <div className="emergency-create-card">
          <div className="emergency-card-header">
            <div className="emergency-icon">
              <Plus size={22} />
            </div>

            <div>
              <h2>Add Emergency Contact</h2>

              <p>
                Give a trusted person emergency access
                using a secure access code.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div className="emergency-form-grid">
              <div className="form-group">
                <label htmlFor="contactName">
                  Contact Name
                </label>

                <div className="input-with-icon">
                  <User size={18} />

                  <input
                    id="contactName"
                    type="text"
                    placeholder="Enter contact name"
                    value={contactName}
                    onChange={(event) =>
                      setContactName(event.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">
                  Contact Email
                </label>

                <div className="input-with-icon">
                  <Mail size={18} />

                  <input
                    id="contactEmail"
                    type="email"
                    placeholder="Enter contact email"
                    value={contactEmail}
                    onChange={(event) =>
                      setContactEmail(event.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="primary-action-button"
              disabled={saving}
            >
              <Plus size={18} />

              {saving
                ? "Creating..."
                : "Create Emergency Access"}
            </button>
          </form>
        </div>

        <div className="emergency-list-card">
          <div className="emergency-card-header">
            <div className="emergency-icon">
              <Shield size={22} />
            </div>

            <div>
              <h2>Emergency Access</h2>

              <p>
                Your trusted emergency contacts and
                access codes.
              </p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={loadEmergencyAccess}
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "spin-icon" : ""
                }
              />
            </button>
          </div>

          {loading ? (
            <div className="emergency-empty-state">
              <RefreshCw size={35} />

              <h3>Loading...</h3>

              <p>
                Loading your emergency access
                contacts.
              </p>
            </div>
          ) : accessList.length === 0 ? (
            <div className="emergency-empty-state">
              <Shield size={45} />

              <h3>No emergency contacts</h3>

              <p>
                Add a trusted contact above to create
                emergency access.
              </p>
            </div>
          ) : (
            <div className="emergency-access-list">
              {accessList.map((item) => (
                <div
                  key={item.id}
                  className="emergency-access-item"
                >
                  <div className="emergency-contact-info">
                    <div className="emergency-contact-avatar">
                      {item.contactName
                        ?.charAt(0)
                        .toUpperCase() || "E"}
                    </div>

                    <div>
                      <h3>{item.contactName}</h3>

                      <p>{item.contactEmail}</p>

                      <span
                        className={
                          item.active
                            ? "emergency-status active"
                            : "emergency-status revoked"
                        }
                      >
                        {item.active
                          ? "Active"
                          : "Revoked"}
                      </span>
                    </div>
                  </div>

                  <div className="emergency-access-code">
                    <span>Access Code</span>

                    <div className="code-row">
                      <strong>
                        {item.accessCode}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(item)
                        }
                        title="Copy access code"
                        disabled={!item.active}
                      >
                        {copiedId === item.id ? (
                          <Check size={17} />
                        ) : (
                          <Copy size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="emergency-actions">
                    {item.active && (
                      <button
                        type="button"
                        className="revoke-button"
                        onClick={() =>
                          handleRevoke(item.id)
                        }
                      >
                        <Ban size={17} />
                        Revoke
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default EmergencyAccess;