import { Outlet, Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { userToken } = useAuth();

  return userToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
