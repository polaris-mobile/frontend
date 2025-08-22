import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axiosConfig";
import logo from "../assets/logos/logo.png"

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post("/auth/login", {
        username,
        password,
      });
      const accessToken = resp.data.access
      localStorage.setItem("access_token", resp.data.access);
      localStorage.setItem("username", resp.data.username);
      localStorage.setItem("refresh_token", resp.data.refresh);
      if (accessToken) {
        const decodedToken = jwtDecode(accessToken);
        localStorage.setItem("role", decodedToken.role); // The role is inside the token
        localStorage.setItem("username", decodedToken.username);
    }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-6 rounded shadow-md w-full max-w-sm border border-default"
      >
        <img 
                    src={logo}
                    alt="Polaris Logo" 
                    className="w-30 h-30 mx-auto mt-5 rounded-full" 
                    
                />
        <div className="text-xl mb-4 text-center text-primary">Login to your account.</div>
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMsg}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-primary">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-app border-default text-primary"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-primary">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded bg-app border-default text-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent text-inverted p-2 rounded hover:opacity-90"
        >
          Log In
        </button>
        <p className="text-center text-secondary mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
