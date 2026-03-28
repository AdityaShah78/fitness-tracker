import React, { useState } from "react";
import "./App.css";
import Toast from "./Toast";

const API = "https://fitness-tracker-t55t.onrender.com";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";

    try {
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.token) {
        setToast({
          message: "Welcome 🎉",
          type: "success",
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          setUser(data.user);
        }, 500);
      } else {
        setToast({
          message: data.message || "Authentication failed",
          type: "error",
        });

        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({
        message: "Something went wrong",
        type: "error",
      });

      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
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
            autoFocus
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default Auth;
