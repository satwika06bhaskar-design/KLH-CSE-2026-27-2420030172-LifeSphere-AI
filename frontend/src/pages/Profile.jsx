import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Profile error:", error);
      setMessage("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Profile</h2>
          <p>{message || "Profile information unavailable."}</p>
          <button
            className="profile-refresh-button"
            onClick={loadProfile}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your LifeSphere account information.</p>
        </div>

        <button
          className="profile-refresh-button"
          onClick={loadProfile}
        >
          Refresh
        </button>
      </div>

      {/* PROFILE SUMMARY */}
      <div className="profile-card profile-summary-card">

        <div className="profile-avatar">
          {initial}
        </div>

        <div className="profile-summary">
          <h2>{user.name || "User"}</h2>
          <p>{user.email}</p>

          <span className="profile-role">
            {user.role || "USER"}
          </span>
        </div>

      </div>

      {/* ACCOUNT INFORMATION */}
      <div className="profile-card">

        <div className="profile-section-header">
          <h2>Account Information</h2>
          <p>Your registered LifeSphere account details.</p>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              ID
            </div>

            <div>
              <span className="profile-label">
                User ID
              </span>

              <strong>
                {user.id}
              </strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              👤
            </div>

            <div>
              <span className="profile-label">
                Full Name
              </span>

              <strong>
                {user.name}
              </strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              @
            </div>

            <div>
              <span className="profile-label">
                Email Address
              </span>

              <strong>
                {user.email}
              </strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              ★
            </div>

            <div>
              <span className="profile-label">
                Account Role
              </span>

              <strong>
                {user.role || "USER"}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* SECURITY */}
      <div className="profile-card">

        <div className="profile-section-header">
          <h2>Security</h2>

          <p>
            Your account is protected using JWT
            authentication and BCrypt password hashing.
          </p>
        </div>

        <div className="profile-security">

          <div className="profile-security-icon">
            ✓
          </div>

          <div>
            <strong>
              Account Protected
            </strong>

            <p>
              Your authentication session is active.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;