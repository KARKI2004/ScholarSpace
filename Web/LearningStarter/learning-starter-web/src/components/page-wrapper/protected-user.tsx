import { Navigate } from "react-router-dom";
import { useAuth } from "../../authentication/use-auth";

export const ProtectedUser = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return children;
};
