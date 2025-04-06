import { useLocation, Link } from "react-router-dom";

const Unauthorized = () => {
  const location = useLocation();
  const { requiredRole } = (location.state as any) || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="mb-4">
          {requiredRole
            ? `This page requires ${requiredRole} privileges.`
            : "You don't have permission to access this page."}
        </p>
        <p className="mb-6">Please contact your administrator if you believe this is an error.</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;