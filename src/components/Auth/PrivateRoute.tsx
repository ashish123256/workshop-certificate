// components/Auth/PrivateRoute.tsx
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

 const PrivateRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, loading, isAdmin, refreshToken } = useAuth();

  useEffect(() => {
    if (user) {
      refreshToken();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};


export default PrivateRoute;