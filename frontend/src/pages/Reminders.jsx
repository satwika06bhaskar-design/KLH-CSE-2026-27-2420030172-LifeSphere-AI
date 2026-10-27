import { useEffect, useState } from "react";

import {
  Bell,
  Plus,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadReminders = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/reminders",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load reminders.");
      }

      const data = await response.json();

      setReminders(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Reminder title is required.");
      return;
    }

    if (!reminderTime) {
      setError("Please select a date and time.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        "http://localhost:8080/api/reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            reminderTime: reminderTime,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Could not create reminder."
        );
      }

      setTitle("");
      setDescription("");
      setReminderTime("");

      setMessage("Reminder created successfully.");

      await loadReminders();
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not create reminder.");
    } finally {
      setCreating(false);
    }
  };

  const handleDone = async (id) => {
    setMessage("");
    setError("");
    setDeletingId(id);

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      setDeletingId(null);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/reminders/${id}`,
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
          data || "Could not complete reminder."
        );
      }

      // Remove immediately from the screen
      setReminders((currentReminders) =>
        currentReminders.filter(
          (reminder) => reminder.id !== id
        )
      );

      setMessage("Reminder completed and deleted.");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not complete reminder."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setDeletingId(id);

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      setDeletingId(null);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/reminders/${id}`,
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
          data || "Could not delete reminder."
        );
      }

      setReminders((currentReminders) =>
        currentReminders.filter(
          (reminder) => reminder.id !== id
        )
      );

      setMessage("Reminder deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not delete reminder."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "";
    }

    return new Date(dateTime).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <div>
          <h1>Reminders</h1>
          <p>
            Keep track of important tasks and events.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadReminders}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="reminder-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="reminder-message error">
          {error}
        </div>
      )}

      <div className="reminders-layout">

        {/* CREATE REMINDER */}
        <div className="reminder-form-card">
          <div className="reminder-form-title">
            <Bell size={22} />
            <h2>Create Reminder</h2>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                placeholder="Enter reminder title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Date & Time</label>

              <input
                type="datetime-local"
                value={reminderTime}
                onChange={(event) =>
                  setReminderTime(
                    event.target.value
                  )
                }
              />
            </div>

            <button
              type="submit"
              className="create-reminder-button"
              disabled={creating}
            >
              <Plus size={18} />

              {creating
                ? "Creating..."
                : "Create Reminder"}
            </button>
          </form>
        </div>

        {/* REMINDER LIST */}
        <div className="reminder-list-card">
          <div className="reminder-list-header">
            <h2>Your Reminders</h2>

            <span>
              {reminders.length} reminder
              {reminders.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {loading ? (
            <div className="reminders-empty">
              <RefreshCw
                size={40}
                className="loading-icon"
              />

              <h3>Loading reminders...</h3>
            </div>
          ) : reminders.length === 0 ? (
            <div className="reminders-empty">
              <Bell size={50} />

              <h3>No reminders</h3>

              <p>
                Create your first reminder to
                get started.
              </p>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((reminder) => (
                <div
                  className="reminder-card"
                  key={reminder.id}
                >
                  <div className="reminder-icon">
                    <Bell size={22} />
                  </div>

                  <div className="reminder-content">
                    <h3>
                      {reminder.title}
                    </h3>

                    {reminder.description && (
                      <p>
                        {reminder.description}
                      </p>
                    )}

                    <div className="reminder-time">
                      {formatDateTime(
                        reminder.reminderTime
                      )}
                    </div>
                  </div>

                  <div className="reminder-actions">
                    <button
                      type="button"
                      className="reminder-action complete"
                      onClick={() =>
                        handleDone(
                          reminder.id
                        )
                      }
                      disabled={
                        deletingId ===
                        reminder.id
                      }
                      title="Done"
                    >
                      <Check size={18} />

                      {deletingId ===
                      reminder.id
                        ? "..."
                        : "Done"}
                    </button>

                    <button
                      type="button"
                      className="reminder-action delete"
                      onClick={() =>
                        handleDelete(
                          reminder.id
                        )
                      }
                      disabled={
                        deletingId ===
                        reminder.id
                      }
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Reminders;