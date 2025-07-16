import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Welcome, {username}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/map"
          className="bg-white shadow rounded-lg p-6 text-center hover:bg-gray-100"
        >
          Map View
        </Link>
        <Link
          to="/table"
          className="bg-white shadow rounded-lg p-6 text-center hover:bg-gray-100"
        >
          Table View
        </Link>
        <Link
          to="/charts"
          className="bg-white shadow rounded-lg p-6 text-center hover:bg-gray-100"
        >
          Charts
        </Link>
        <a
          href="/api/export/csv"
          className="bg-white shadow rounded-lg p-6 text-center hover:bg-gray-100"
        >
          Export CSV
        </a>
        <a
          href="/api/export/kml"
          className="bg-white shadow rounded-lg p-6 text-center hover:bg-gray-100"
        >
          Export KML
        </a>
        {role === "admin" && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            Admin Settings (future)
          </div>
        )}
      </div>
    </div>
  );
}
