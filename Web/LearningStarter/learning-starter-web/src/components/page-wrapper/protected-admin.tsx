import { Navigate } from "react-router-dom";
import { useAuth } from "../../authentication/use-auth";

export const ProtectedAdmin = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "Admin") return <Navigate to="/home" />;

  return children;
};
