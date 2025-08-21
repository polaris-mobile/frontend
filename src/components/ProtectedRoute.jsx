import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');

  // If there's no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If logged in, show the child component (e.g., the MainLayout)
  return <Outlet />;
};

export default ProtectedRoute;