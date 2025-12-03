import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../../stores/useUserStore.js';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useUserStore(state => state.user);
  const fetchProfile = useUserStore(state => state.fetchProfile);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user && !checking) {
      setChecking(true);
      fetchProfile({ skipAuthRedirect: true })
        .catch(() => {}) // im lặng khi 401
        .finally(() => { if (mounted) setChecking(false); });
    }
    return () => { mounted = false; };
  }, [user, checking, fetchProfile]);

  if (checking) return <div>Đang kiểm tra phiên...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;