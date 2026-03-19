import React, { useState } from "react";
import "./App.css";

const API = "https://fitness-tracker-t55t.onrender.com";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";

    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } else {
      alert(data.message || "Authentication failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">FitTrack</p>
        <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Log in to manage your workouts, weight history, and progress."
            : "Start tracking workouts and body progress with your own dashboard."}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
