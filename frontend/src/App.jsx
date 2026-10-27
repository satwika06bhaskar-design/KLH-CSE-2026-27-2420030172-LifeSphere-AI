import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication when the application starts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setPage("login");
      setLoading(false);
      return;
    }

    // Get the actual logged-in user from backend
    fetch("http://localhost:8080/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Invalid or expired token");
        }

        return response.json();
      })
      .then((data) => {
        setUser(data);
        setPage("dashboard");
      })
      .catch((error) => {
        console.error("Authentication error:", error);

        // Remove invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setPage("login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login
  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);

    setUser(data);
    setPage("dashboard");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPage("login");
  };

  // Show loading while checking JWT
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Loading LifeSphere AI...</h2>
        </div>
      </div>
    );
  }

  // Register
  if (page === "register") {
    return (
      <Register
        onRegister={() => setPage("login")}
        onLogin={() => setPage("login")}
      />
    );
  }

  // Dashboard
  if (page === "dashboard") {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Login
  return (
    <Login
      onLogin={handleLogin}
      onRegister={() => setPage("register")}
    />
  );
}

export default App;