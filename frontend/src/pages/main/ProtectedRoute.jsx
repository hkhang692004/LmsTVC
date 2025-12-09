import React, { useEffect, useState, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../../stores/useUserStore.js';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useUserStore(state => state.user);
  const fetchProfile = useUserStore(state => state.fetchProfile);
  const [checking, setChecking] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;
      
      if (!user) {
        try {
          await fetchProfile(); // ✅ Không cần skipAuthRedirect
        } catch (err) {
          // Interceptor đã xử lý redirect, chỉ log error
          console.log('Auth check failed, interceptor handling redirect');
        }
      }
      setChecking(false);
    };
    
    checkAuth();
  }, []);

  // Loading state
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Đang kiểm tra phiên...</p>
        </div>
      </div>
    );
  }

  // ✅ Fallback: Nếu interceptor chưa redirect (edge case)
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;