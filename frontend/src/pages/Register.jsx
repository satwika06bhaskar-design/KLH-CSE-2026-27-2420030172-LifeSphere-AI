import { useState } from "react";

function Register({ onRegister, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Registration failed.");
        return;
      }

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");

      // Return to login after successful registration
      setTimeout(() => {
        if (onRegister) {
          onRegister();
        }
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>LifeSphere AI</h1>

        <h2>Create Account</h2>

        <p>Create your LifeSphere account</p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Already have an account?{" "}

          <button
            type="button"
            className="link-button"
            onClick={onLogin}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;