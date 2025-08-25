import { Navigate } from 'react-router-dom';
/* eslint-disable react/prop-types */

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />; // Redirige al login si no hay token
  }

  return children;
};

export default ProtectedRoute;
