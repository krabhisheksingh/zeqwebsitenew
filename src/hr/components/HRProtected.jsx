import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/hrStorage';

export default function HRProtected({ allowedRoles, children }) {
  const session = getSession();

  if (!session || !session.role) {
    return <Navigate to="/employee-login" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    // Redirect to correct dashboard
    if (session.role === 'superadmin' || session.role === 'admin') {
      return <Navigate to="/employee-login/admin" replace />;
    }
    return <Navigate to="/employee-login/dashboard" replace />;
  }

  return children;
}
