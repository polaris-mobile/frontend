import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import logo from "../assets/logos/logo.png"


export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // The register endpoint you created in Django
      await api.post("/auth/register", {
        username,
        password,
        role: "VIEWER", // New users will have the VIEWER role
      });

      // After successful registration, automatically navigate to login
      navigate("/login");

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error) {
        setErrorMsg(err.response.data.error); // Show specific error from backend
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
                <img 
                    src={logo}
                    alt="Polaris Logo" 
                    className="w-30 h-30 mx-auto mt-5 rounded-full" 
                    
                />
        <div className="text-xl mb-4 text-center text-gray-700">Create your account to get started.</div>
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMsg}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}