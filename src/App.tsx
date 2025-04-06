import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/SignUp";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Dashboard from "./components/Admin/Dashboard";
import FeedbackForm from "./components/Feedback/FeedbackForm";
import Unauthorized from "./components/Shared/Unauthorized";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
           
          {/* Regular authenticated routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/feedback/:uniqueLink" element={<FeedbackForm />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;