import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  // Retrieve the token from local storage
  const token = localStorage.getItem('token');

  // Check if the token exists
  const isAuthenticated = !!token;

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoutes;
