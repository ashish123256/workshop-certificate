import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../Shared/LoadingSpinner";

interface PrivateRouteProps {
  adminOnly?: boolean;
  redirectPath?: string;
}

const PrivateRoute = ({
  adminOnly = false,
  redirectPath = "/login",
}: PrivateRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location, requiredRole: "admin" }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;