import { useState } from "react";
import { useNavigate } from "react-router";
import "./authPage.css";

const AuthPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", "your_hardcoded_token"); // Mark as logged in
      navigate("/"); // Redirect to home or admin
    } else {
      setError(data.message || "Login failed");
    }
  };

  return (
    <div className="authPage">
      <div className="authContainer">
        <img src="/general/logo.png" alt="" />
        <h1>Admin</h1>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              required
              name="username"
              onChange={handleChange}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              required
              name="password"
              onChange={handleChange}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
